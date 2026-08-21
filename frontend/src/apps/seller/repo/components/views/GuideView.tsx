import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Settings, Package, ShoppingBag, Store, Boxes, 
  Calculator, ChevronRight, Search, Lightbulb, ArrowRight, Sparkles, PlayCircle, Truck, Database, Users, Globe, Printer, Link, ShieldCheck, LayoutDashboard, Layers, RefreshCw, History, ChevronDown
} from 'lucide-react';

const CHAPTERS = [
  {
    id: 'pengaturan',
    title: 'Pengaturan Sistem',
    icon: Settings,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    content: (navigate: any) => (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Settings className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan Sistem</h2>
            <p className="text-slate-500 dark:text-slate-400">Langkah pertama sebelum mulai mengelola toko.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">1</span>
              Profil Toko & Struk Kasir
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Atur nama toko, alamat, nomor telepon, dan logo yang akan dicetak di setiap struk transaksi pelanggan.
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 mb-4 space-y-1">
              <li>Buka menu <strong>Settings &gt; Aplikasi</strong>.</li>
              <li>Isi informasi profil toko yang lengkap.</li>
              <li>Tambahkan Footer/Pesan penutup di struk kasir (contoh: "Terima kasih, barang tidak bisa ditukar").</li>
            </ul>
            <button onClick={() => navigate('/seller/settings')} className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
              Atur Profil Toko <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">2</span>
              Hak Akses Karyawan (Roles)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Buat batasan agar Kasir tidak bisa melihat Laporan Keuangan, atau Staf Gudang tidak bisa melihat harga modal.
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 mb-4 space-y-1">
              <li>Buka <strong>Settings &gt; Roles & Permissions</strong> untuk membuat profil akses baru.</li>
              <li>Buka <strong>Settings &gt; Users / Staff</strong> untuk menambahkan akun bagi karyawan dan menetapkan Role mereka.</li>
            </ul>
            <button onClick={() => navigate('/seller/settings/users')} className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
              Kelola Pengguna <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'masterdata',
    title: 'Master Data & Pelanggan',
    icon: Database,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    content: (navigate: any) => (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
            <Database className="w-6 h-6 text-teal-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Master Data & Pelanggan</h2>
            <p className="text-slate-500 dark:text-slate-400">Siapkan data dasar seperti Kategori, Supplier, dan database Pelanggan.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-500" />
              Kelola Master Data
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Sebelum menambahkan produk secara massal, pastikan Anda sudah membuat struktur kategori dan daftar pemasok (Supplier).
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 mb-4 space-y-1">
              <li><strong>Kategori:</strong> Buka menu Master Data &gt; Kategori. Gunakan kategori untuk mengelompokkan barang agar mudah dicari saat transaksi kasir.</li>
              <li><strong>Supplier:</strong> Catat daftar pemasok beserta kontak mereka. Ini sangat berguna ketika Anda ingin melacak Riwayat Restock berdasarkan supplier.</li>
              <li><strong>Gudang:</strong> Pastikan Anda memiliki setidaknya 1 Gudang Utama yang didaftarkan.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-500" />
              Database Pelanggan (CRM)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Kumpulkan kontak pelanggan untuk program loyalitas dan memudahkan pelacakan riwayat transaksi mereka.
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 mb-4 space-y-1">
              <li>Buka menu <strong>Pelanggan (Customers)</strong>.</li>
              <li>Klik Tambah Pelanggan, masukkan Nama, No HP, dan Alamat.</li>
              <li>Saat melakukan transaksi di Kasir (POS), Anda dapat mengaitkan transaksi tersebut ke nama pelanggan ini. Ini berguna untuk mencatat pembelian hutang (Payables/Receivables).</li>
            </ul>
            <button onClick={() => navigate('/seller/customers')} className="text-sm font-semibold text-teal-600 flex items-center gap-1 hover:gap-2 transition-all mt-4">
              Buka Database Pelanggan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'katalog',
    title: 'Katalog & Stok',
    icon: Package,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    content: (navigate: any) => (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Package className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Katalog & Stok</h2>
            <p className="text-slate-500 dark:text-slate-400">Pusat kendali barang dagangan Anda.</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 transition-colors p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 relative z-10">Alur Manajemen Produk & Stok Gudang</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm leading-relaxed max-w-3xl relative z-10">
            Katalog adalah nyawa bisnis Anda. Di Bizora, stok produk yang sudah aktif tidak boleh diubah angkanya secara sembarangan (di-<em>bypass</em>) demi menghindari kebocoran data. Anda wajib mengikuti Standar Operasional (SOP) Manajemen Gudang berikut:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
                <Package className="w-5 h-5" /> 1. Tambah Produk
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-2">
                <li>Buka menu <strong>Katalog</strong>, klik tombol <strong className="text-emerald-600 dark:text-emerald-500">Tambah Produk</strong>.</li>
                <li>Isi detail penting: Harga Beli (HPP), Harga Jual, dan <strong>SKU (Kode Unik)</strong>.</li>
                <li><strong>Wajib:</strong> Jika Anda pakai fitur Omnichannel, pastikan kode SKU ini diketik persis sama dengan yang ada di marketplace online!</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
                <Boxes className="w-5 h-5" /> 2. Inbound (Terima Barang)
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-2">
                <li>Buka menu <strong>Gudang &gt; Penerimaan Barang</strong>.</li>
                <li>Gunakan menu ini <strong>hanya</strong> saat Anda menyetok barang baru (kulakan/restock) dari pihak <em>Supplier</em>.</li>
                <li>Angka stok lama Anda akan diakumulasikan (bertambah) secara aman ke sistem pusat.</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
                <Database className="w-5 h-5" /> 3. Stock Opname (Audit)
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-2">
                <li>Buka menu <strong>Gudang &gt; Stock Opname</strong>.</li>
                <li>Lakukan ini secara berkala saat Anda <strong>Audit Bulanan</strong>.</li>
                <li>Jika fisik barang hilang/rusak (misal di sistem ada 10, di gudang sisa 9), sesuaikan angka aslinya di sini. Sistem akan mencatat riwayat kehilangan tersebut.</li>
              </ul>
            </div>
          </div>
          
          <button onClick={() => navigate('/seller/products')} className="mt-8 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20 text-center relative z-10">
            Buka Halaman Katalog Sekarang
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'kasir',
    title: 'Transaksi Kasir',
    icon: Store,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    content: (navigate: any) => (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Store className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Toko Fisik (POS)</h2>
            <p className="text-slate-500 dark:text-slate-400">Kasir cepat untuk pelanggan offline.</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-600/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-2xl font-bold mb-4 relative z-10">Fitur Point of Sale (POS) Khusus</h3>
          <p className="text-indigo-100 mb-6 max-w-3xl relative z-10 leading-relaxed text-sm">
            Menu <strong>Toko Offline</strong> dirancang untuk kasir fisik yang berhadapan langsung dengan pembeli. 
            Saat Anda membuka menu ini, sidebar akan secara otomatis disembunyikan agar tampilan kasir mengambil layar penuh secara imersif, 
            memudahkan navigasi dan eksekusi transaksi yang cepat.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            <div className="bg-indigo-700/50 backdrop-blur-sm p-5 rounded-xl border border-indigo-500/50 hover:bg-indigo-700/70 transition-colors">
              <h4 className="font-bold flex items-center gap-2 mb-3"><Search className="w-4 h-4 text-indigo-300" /> 1. Input Pesanan</h4>
              <ul className="text-sm text-indigo-100 list-disc pl-4 space-y-2">
                <li>Gunakan <strong>Scanner Barcode</strong> (tembak ke kode) atau ketik manual di kolom pencarian.</li>
                <li>Klik produk yang dicari untuk menambahkannya ke nota keranjang (di panel kanan).</li>
                <li>Ubah <em>Quantity</em> atau input diskon manual jika ada penawaran khusus.</li>
              </ul>
            </div>

            <div className="bg-indigo-700/50 backdrop-blur-sm p-5 rounded-xl border border-indigo-500/50 hover:bg-indigo-700/70 transition-colors">
              <h4 className="font-bold flex items-center gap-2 mb-3"><Calculator className="w-4 h-4 text-indigo-300" /> 2. Pembayaran Kasir</h4>
              <ul className="text-sm text-indigo-100 list-disc pl-4 space-y-2">
                <li>Pilih metode pembayaran (Tunai, QRIS, atau Transfer).</li>
                <li>Jika <strong>Tunai</strong>, Anda cukup memasukkan nominal uang yang diberikan pelanggan, sistem otomatis menghitung kembalian.</li>
                <li>Klik tombol hijau <strong>Bayar / Checkout</strong>.</li>
              </ul>
            </div>

            <div className="bg-indigo-700/50 backdrop-blur-sm p-5 rounded-xl border border-indigo-500/50 hover:bg-indigo-700/70 transition-colors">
              <h4 className="font-bold flex items-center gap-2 mb-3"><Printer className="w-4 h-4 text-indigo-300" /> 3. Struk & Potong Stok</h4>
              <ul className="text-sm text-indigo-100 list-disc pl-4 space-y-2">
                <li>Setelah berhasil, <strong>struk kasir termal</strong> akan otomatis di-<em>generate</em> di layar untuk diprint.</li>
                <li><strong>Stok akan langsung dipotong</strong> dari gudang. Jika terhubung ke Omnichannel, stok toko online Anda juga berkurang detik itu juga!</li>
              </ul>
            </div>
          </div>
          
          <button onClick={() => navigate('/seller/pos')} className="mt-8 px-5 py-3 w-full bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-colors shadow-lg relative z-10 text-center">
            Buka Halaman Kasir POS 
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'channel-penjualan',
    title: 'Channel Penjualan',
    icon: Globe,
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
    content: (navigate: any) => (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
            <Globe className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Channel Penjualan</h2>
            <p className="text-slate-500 dark:text-slate-400">Hubungkan toko online Anda (Shopee, Tokopedia, TikTok).</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800/50 p-6 md:p-8 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 relative z-10">Alur Manajemen Marketplace</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm leading-relaxed max-w-3xl relative z-10">
            Agar pesanan dan stok dari Shopee, Tokopedia, atau TikTok Shop terpusat dalam satu layar, sistem Bizora memiliki 5 tahapan menu di bawah menu <strong>Marketplace</strong> yang harus Anda pahami:
          </p>

          <div className="space-y-4 relative z-10">
            
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-sky-200/60 dark:border-sky-800/60 shadow-sm hover:shadow-md transition-all flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-800 dark:text-slate-200">1. Status Koneksi (Dashboard)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Pusat ringkasan informasi yang menampilkan statistik performa penjualan Anda dari berbagai channel secara visual, serta notifikasi jika ada channel yang terputus (expired token).
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-sky-200/60 dark:border-sky-800/60 shadow-sm hover:shadow-md transition-all flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                <Link className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-800 dark:text-slate-200">2. Akun Terhubung</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Langkah pertama yang wajib dilakukan! Klik tombol <strong>Connect</strong> pada logo marketplace untuk mengarahkan Anda ke proses otorisasi resmi (Login di Seller Center terkait). Pastikan statusnya menjadi <span className="font-semibold text-emerald-500">Connected</span>.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-sky-200/60 dark:border-sky-800/60 shadow-sm hover:shadow-md transition-all flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-800 dark:text-slate-200">3. Pemetaan Produk (Product Mapping)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Tahap mengawinkan data. Anda harus memberitahu sistem bahwa produk A di toko fisik adalah sama dengan produk B di Shopee. Gunakan tombol <strong>Auto-Map by SKU</strong> agar sistem menautkan ribuan produk secara instan berdasarkan kesamaan kode SKU.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-sky-200/60 dark:border-sky-800/60 shadow-sm hover:shadow-md transition-all flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-800 dark:text-slate-200">4. Pusat Sinkronisasi (Sync Center)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Meskipun sistem otomatis berjalan di latar belakang (real-time), Anda dapat melakukan sinkronisasi paksa / manual di sini jika Anda baru saja mengubah harga atau stok masal dan ingin segera di-<em>push</em> (dilempar) ke semua channel.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-sky-200/60 dark:border-sky-800/60 shadow-sm hover:shadow-md transition-all flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <History className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-800 dark:text-slate-200">5. Riwayat Sinkronisasi</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gunakan menu ini sebagai alat bantu <em>troubleshooting</em>. Jika ada stok yang gagal terpotong di marketplace, Anda bisa melihat alasannya di sini (misalnya: server marketplace sedang <em>down</em> atau produk di marketplace sedang dikunci promosi).
                </p>
              </div>
            </div>

          </div>
          
          <button onClick={() => navigate('/seller/marketplace')} className="mt-8 w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-sky-500/20 text-center relative z-10">
            Buka Pengaturan Channel Penjualan Sekarang
          </button>
        </div>

      </div>
    )
  },
  {
    id: 'pengiriman',
    title: 'Pesanan & Kirim',
    icon: Truck,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    content: (navigate: any) => (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <Truck className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pesanan & Pengiriman</h2>
            <p className="text-slate-500 dark:text-slate-400">Proses pesanan dan cetak resi pengiriman.</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 transition-colors p-6 md:p-8">
          <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">Alur Pemrosesan Pesanan (Fulfillment)</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm leading-relaxed max-w-3xl">
            Semua pesanan masuk, baik dari Toko Fisik (POS) maupun pesanan online dari seluruh channel Marketplace (Shopee, Tokopedia, TikTok), terpusat di satu layar pada menu <strong>Semua Pesanan</strong>. Berikut adalah standar operasional (SOP) cara memprosesnya:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-rose-200/60 dark:border-rose-800/60 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold flex items-center gap-2 mb-3 text-rose-700 dark:text-rose-400">
                <ShoppingBag className="w-5 h-5" /> 1. Konfirmasi Pesanan
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-2">
                <li>Buka menu <strong>Semua Pesanan</strong>.</li>
                <li>Filter tabel ke tab <strong>Perlu Diproses (New)</strong> untuk melihat pesanan yang baru masuk.</li>
                <li>Klik tombol <strong>Terima Pesanan</strong> pada pesanan yang valid. Pesanan tersebut kini berpindah status menjadi <em>Diproses</em>.</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-rose-200/60 dark:border-rose-800/60 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold flex items-center gap-2 mb-3 text-rose-700 dark:text-rose-400">
                <Package className="w-5 h-5" /> 2. Packing & Cetak Resi
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-2">
                <li>Klik tombol <strong className="text-indigo-600 dark:text-indigo-400">Cetak AWB / Resi</strong> pada pesanan yang sedang diproses.</li>
                <li>Sistem akan men-<em>generate</em> label pengiriman (Airway Bill) resmi lengkap dengan barcode kurir.</li>
                <li>Print label tersebut dan tempelkan pada paket barang yang sudah dibungkus rapi.</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-rose-200/60 dark:border-rose-800/60 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold flex items-center gap-2 mb-3 text-rose-700 dark:text-rose-400">
                <Truck className="w-5 h-5" /> 3. Pengiriman
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-2">
                <li>Setelah paket siap dilabeli, klik <strong>Kirim Pesanan (Request Pickup)</strong>.</li>
                <li>Sistem otomatis akan memanggil kurir ekpedisi untuk datang ke toko (jika didukung marketplace), atau Anda bisa mengantarnya ke gerai terdekat.</li>
                <li>Status akan berubah otomatis menjadi <em>Selesai</em> saat paket diterima pembeli.</li>
              </ul>
            </div>
          </div>
          
          <button onClick={() => navigate('/seller/orders')} className="mt-8 w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-rose-500/20 text-center">
            Buka Halaman Pesanan Sekarang
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'keuangan',
    title: 'Keuangan & Laporan',
    icon: Calculator,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    content: (navigate: any) => (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Calculator className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Keuangan & Laporan</h2>
            <p className="text-slate-500 dark:text-slate-400">Pantau arus kas, catat pengeluaran operasional, dan cetak laporan akhir bulan.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 font-bold">1</div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Mencatat Pengeluaran Operasional (Expenses)</h3>
            </div>
            <div className="pl-11 text-sm text-slate-600 dark:text-slate-400 space-y-3">
              <p>Agar Laba Bersih (Net Profit) di laporan Anda akurat, Anda wajib mencatat semua biaya yang keluar di luar modal barang.</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Buka menu <strong>Keuangan &gt; Pengeluaran</strong>.</li>
                <li>Klik tombol <strong>Tambah Pengeluaran</strong>.</li>
                <li>Masukkan jumlah biaya, tanggal, dan pilih kategori (misal: Biaya Operasional untuk listrik/internet, Biaya Packaging untuk kardus/lakban, atau Gaji Karyawan).</li>
                <li>Catatan ini akan otomatis memotong total pendapatan kotor Anda di laporan akhir.</li>
              </ul>
              <button onClick={() => navigate('/seller/expenses')} className="mt-2 text-amber-600 font-semibold hover:underline flex items-center gap-1">
                Buka Menu Pengeluaran &rarr;
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 font-bold">2</div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Mencatat Pemasukan Lain (Other Incomes)</h3>
            </div>
            <div className="pl-11 text-sm text-slate-600 dark:text-slate-400 space-y-3">
              <p>Selain dari penjualan produk (yang otomatis dicatat sistem), Anda mungkin menerima uang dari sumber lain.</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Buka menu <strong>Keuangan &gt; Pemasukan Lain</strong>.</li>
                <li>Catat pendapatan ekstra seperti: Cashback Ongkir dari ekspedisi, klaim ganti rugi barang hilang, atau investasi masuk.</li>
              </ul>
              <button onClick={() => navigate('/seller/incomes')} className="mt-2 text-amber-600 font-semibold hover:underline flex items-center gap-1">
                Buka Menu Pemasukan Lain &rarr;
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800/50 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">3</div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Membaca & Mencetak Laporan Penjualan</h3>
            </div>
            <div className="pl-11 text-sm text-slate-600 dark:text-slate-400 space-y-4">
              <p>Ini adalah fitur kunci untuk mengetahui apakah bisnis Anda benar-benar sehat. Sistem akan menghitung seluruh indikator keuangan secara transparan. Berikut adalah rumus yang digunakan sistem kami:</p>
              
              <div className="bg-white/60 dark:bg-slate-900/50 p-4 rounded-xl space-y-3 font-mono text-[13px] border border-amber-200/50 dark:border-amber-700/50">
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-200/40 pb-2">
                  <span className="text-slate-500">Total Penjualan (Gross)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">= Total nominal transaksi pelanggan</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-200/40 pb-2">
                  <span className="text-slate-500">Harga Pokok Penjualan (HPP)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">= HPP Produk × Qty Terjual</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-200/40 pb-2 text-indigo-600 dark:text-indigo-400">
                  <span className="font-bold">Laba Kotor (Gross Profit)</span>
                  <span className="font-bold">= Penjualan Gross - Total HPP</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-200/40 pb-2">
                  <span className="text-slate-500">Total Pengeluaran Operasional</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">= Iklan + Packing + Gaji, dll</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-amber-200/40 pb-2">
                  <span className="text-slate-500">Total Pemasukan Lain</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">= Cashback Ongkir + Klaim Ekspedisi</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between pt-2 pb-2 border-b border-amber-200/40 text-emerald-700 dark:text-emerald-400">
                  <span className="font-extrabold uppercase">Laba Bersih (Net Profit)</span>
                  <span className="font-extrabold">= Laba Kotor - Pengeluaran + Pemasukan Lain</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between pt-1">
                  <span className="text-slate-500">Persentase Margin Keuntungan</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">= (Laba Bersih ÷ Total Penjualan) × 100%</span>
                </div>
              </div>

              <ul className="list-disc pl-5 space-y-1.5 mt-4">
                <li>Buka menu <strong>Keuangan &gt; Laporan Penjualan</strong>.</li>
                <li>Gunakan filter tanggal di kanan atas untuk melihat laporan bulan tertentu.</li>
                <li>Klik tombol <strong>Export PDF</strong> untuk mengunduh laporan resmi dalam format profesional yang siap diserahkan kepada pihak investor, pajak, atau untuk audit internal.</li>
              </ul>
              <button onClick={() => navigate('/seller/sales-report')} className="mt-2 text-amber-600 font-bold hover:underline flex items-center gap-1">
                Buka Laporan Penjualan Sekarang &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export const GuideView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const currentChapterContent = CHAPTERS.find(c => c.id === activeChapter);

  return (
    <div className="w-full space-y-4 pb-20">
      
      {/* Standard Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Bantuan Resmi Bizora</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            Kuasai Aplikasi Anda
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-full truncate">
            Pelajari cara mengelola stok, kasir, hingga menyinkronkan seluruh toko online Anda dalam satu dasbor yang luar biasa.
          </p>
        </div>
      </div>

      {/* Interactive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-12 gap-5 lg:gap-8 items-start">
        
        {/* Mobile Dropdown (Visible only on < md) */}
        <div className="md:hidden relative z-50">
          <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
            Pilih Panduan
          </label>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-3.5 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm transition-shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {currentChapterContent && (
                  <>
                    <currentChapterContent.icon className={`w-5 h-5 ${currentChapterContent.color}`} />
                    <span>{currentChapterContent.title}</span>
                  </>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="max-h-[300px] overflow-y-auto py-1">
                    {CHAPTERS.map(chapter => {
                      const isActive = chapter.id === activeChapter;
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => {
                            setActiveChapter(chapter.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? chapter.bg : 'bg-slate-100 dark:bg-slate-700'
                          }`}>
                            <chapter.icon className={`w-4 h-4 ${isActive ? chapter.color : 'text-slate-500'}`} />
                          </div>
                          <span className={`font-semibold text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {chapter.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Modern Sidebar Tabs (Hidden on < md) */}
        <div className="hidden md:block md:col-span-4 lg:col-span-3 xl:col-span-2 space-y-1 sticky top-24">
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 mt-1">Daftar Panduan</h3>
          {CHAPTERS.map((chapter) => {
            const isActive = activeChapter === chapter.id;
            const Icon = chapter.icon;
            return (
              <button
                key={chapter.id}
                onClick={() => setActiveChapter(chapter.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-left ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold scale-100' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 scale-[0.98]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? chapter.bg : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? chapter.color : 'text-slate-400'}`} />
                </div>
                <span className={`font-semibold text-[13px] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                  {chapter.title}
                </span>
                {isActive && (
                  <motion.div layoutId="activeTabIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area with Framer Motion Transitions */}
        <div className="md:col-span-8 lg:col-span-9 xl:col-span-10 min-h-[500px]">
          <AnimatePresence mode="wait">
            {currentChapterContent && (
              <motion.div
                key={currentChapterContent.id}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700"
              >
                {currentChapterContent.content(navigate)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
