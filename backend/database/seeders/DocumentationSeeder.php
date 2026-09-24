<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DocumentationCategory;
use App\Models\DocumentationArticle;
use Illuminate\Support\Facades\DB;

class DocumentationSeeder extends Seeder
{
    public function run()
    {
        // Bersihkan data lama agar tidak duplikat
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DocumentationArticle::truncate();
        DocumentationCategory::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ==========================================
        // 1. PANDUAN PENDAFTARAN & LANGGANAN
        // ==========================================
        $catUmum = DocumentationCategory::create([
            'name' => 'Pendaftaran & Langganan',
            'slug' => 'pendaftaran-langganan',
            'module' => 'umum',
            'order' => 1,
            'is_active' => true
        ]);

        DocumentationArticle::create([
            'category_id' => $catUmum->id,
            'title' => 'Cara Mendaftar dan Berlangganan Paket Bizora',
            'slug' => 'cara-mendaftar-dan-berlangganan',
            'short_description' => 'Penjelasan lengkap dari awal mulai mendaftar akun, memilih kategori bisnis, hingga berlangganan paket beserta rumusnya.',
            'content' => '
                <h2>1. Memulai Pendaftaran (Registrasi)</h2>
                <p>Proses penggunaan Bizora dimulai dari halaman pendaftaran. Calon pengguna (pemilik usaha) wajib mengisi data dasar meliputi Nama Lengkap, Email, Password, serta Nama Usaha/Toko mereka.</p>
                <p>Setelah mendaftar, sistem Bizora akan secara otomatis membuatkan satu ruang kerja khusus (Tenant/Workspace) yang datanya terisolasi dan aman dari pengguna lain.</p>
                
                <h2>2. Memilih Modul / Kategori Bisnis</h2>
                <p>Saat pertama kali masuk (login) setelah mendaftar, pengguna akan dihadapkan pada layar <i>Onboarding</i>. Di sini, pengguna wajib memilih <b>Kategori Bisnis</b> yang dijalankan. Hal ini sangat penting karena antarmuka (UI) Bizora akan menyesuaikan diri dengan kategori tersebut.</p>
                <ul>
                    <li><b>Toko Retail & Grosir:</b> Cocok untuk minimarket, toko kelontong, apotek, dan toko pakaian (mendukung varian dan barcode).</li>
                    <li><b>Jasa & Servis:</b> Cocok untuk bengkel, servis AC, jasa cuci sepatu, dan salon (menggunakan sistem SPK/Work Order dan Teknisi).</li>
                    <li><b>Kuliner (F&B):</b> Cocok untuk restoran, cafe, atau food truck (mendukung manajemen meja, resep/BOM, dan sinkronisasi dapur).</li>
                    <li><b>Budidaya:</b> Cocok untuk peternakan (ayam, lele, dll) dan perkebunan (fokus pada siklus hidup, pakan, mortalitas, dan panen).</li>
                    <li><b>Seller Hub (Omnichannel):</b> Cocok untuk pebisnis online yang berjualan di berbagai marketplace seperti Shopee, Tokopedia, dan TikTok Shop (fokus sinkronisasi stok otomatis).</li>
                </ul>

                <h2>3. Sistem Langganan (Paket)</h2>
                <p>Setelah memilih modul, pengguna bisa memilih paket berlangganan. Paket di Bizora dirancang untuk mendukung perkembangan UMKM dari skala kecil hingga besar:</p>
                <ul>
                    <li><b>Paket Dasar (Basic / Starter):</b> Ditujukan untuk usaha mikro yang baru memulai. Biasanya membatasi jumlah transaksi per bulan, jumlah kasir (user) yang bisa login bersamaan, dan memiliki fitur operasional standar.</li>
                    <li><b>Paket Menengah (Pro / Growth):</b> Memiliki limit transaksi yang jauh lebih tinggi (atau tanpa batas), dukungan multi-cabang (outlet), analitik lanjutan, dan fitur manajemen inventaris yang lebih dalam.</li>
                    <li><b>Paket Enterprise / Premium:</b> Fitur lengkap tanpa batasan. Bisa mendapatkan dukungan prioritas (Priority Support), kustomisasi, dan integrasi API ke sistem pihak ketiga.</li>
                </ul>
                
                <h2>4. Perhitungan Harga & Paket Langganan (Rumus Landing Page)</h2>
                <p>Bagi calon pengguna yang melihat paket di Landing Page, seringkali muncul pertanyaan terkait perbedaan harga langganan Bulanan dan Tahunan. Berikut adalah rumus yang digunakan oleh sistem Bizora untuk menghitung tagihan.</p>
                
                <p>Jika pengguna memilih <b>Pembayaran Bulanan (Monthly)</b>, maka tagihan mutlak sesuai harga paket dasar per bulan.</p>
                <blockquote>Tagihan Bulanan = Harga Paket Dasar + PPN (11%)</blockquote>
                
                <p>Jika pengguna memilih <b>Pembayaran Tahunan (Annually)</b>, sistem memberikan diskon khusus (hanya bayar 10 bulan gratis 2 bulan). Rumusnya adalah:</p>
                <blockquote>Tagihan Tahunan = (Harga Paket Dasar x 10 Bulan) + PPN (11%)</blockquote>
                
                <p>Apabila pengguna ingin <i>upgrade</i> dari paket Basic ke Pro di pertengahan bulan berjalan, sistem akan menggunakan perhitungan Prorata:</p>
                <blockquote>Nilai Prorata = (Sisa Hari Aktif / 30 Hari) x Harga Paket Lama<br>
                Tagihan Upgrade = Harga Paket Baru - Nilai Prorata</blockquote>
            ',
            'status' => 'published',
            'module' => 'umum',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        // ==========================================
        // 2. MODUL KEUANGAN & AKUNTANSI
        // ==========================================
        $catKeuangan = DocumentationCategory::create([
            'name' => 'Modul Keuangan & Akuntansi',
            'slug' => 'modul-keuangan',
            'module' => 'umum',
            'order' => 2,
            'is_active' => true
        ]);

        DocumentationArticle::create([
            'category_id' => $catKeuangan->id,
            'title' => 'Rumus Keuangan: Laba Rugi dan HPP',
            'slug' => 'rumus-keuangan-laba-rugi-hpp',
            'short_description' => 'Penjelasan mengenai kalkulasi Laba Kotor, Laba Bersih, dan Harga Pokok Penjualan (HPP) di sistem.',
            'content' => '
                <p>Modul keuangan di Bizora berjalan otomatis di latar belakang berdasarkan setiap transaksi kasir, pembelian, dan input pengeluaran. Berikut adalah rumus baku yang digunakan sistem untuk menghasilkan angka di Dashboard Analitik Anda.</p>
                
                <h2>1. Harga Pokok Penjualan (HPP)</h2>
                <p>Bizora umumnya menggunakan metode <b>Average Cost (Biaya Rata-Rata)</b> untuk pergerakan stok barang retail. Rumusnya:</p>
                <blockquote>HPP Rata-Rata = ((Stok Lama x HPP Lama) + (Stok Masuk x Harga Beli Baru)) / Total Stok Setelah Masuk</blockquote>
                <p>Contoh: Anda punya 10 pensil seharga modal Rp1.000. Anda lalu beli (kulakan) 10 pensil lagi dengan harga modal naik menjadi Rp1.200.<br>
                HPP Baru = ((10 x 1000) + (10 x 1200)) / 20 = <b>Rp 1.100 per pensil.</b></p>
                
                <h2>2. Laba Kotor (Gross Profit)</h2>
                <p>Laba kotor dihitung per transaksi atau per bulan hanya dari margin produk yang terjual.</p>
                <blockquote>Laba Kotor = Total Pendapatan Penjualan (Sales) - Total HPP dari barang yang terjual</blockquote>
                
                <h2>3. Laba Bersih (Net Profit)</h2>
                <p>Laba bersih adalah nilai yang paling penting bagi bisnis, karena sudah dikurangi beban operasional.</p>
                <blockquote>Laba Bersih = Laba Kotor - Total Pengeluaran Operasional (Gaji, Listrik, Sewa, dsb)</blockquote>
                
                <h2>4. Nilai Aset Inventaris (Inventory Value)</h2>
                <p>Muncul di laporan neraca Anda.</p>
                <blockquote>Nilai Aset = Total Jumlah Stok Barang Saat Ini x HPP Masing-masing Barang</blockquote>
            ',
            'status' => 'published',
            'module' => 'umum',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        // ==========================================
        // 3. PANDUAN LENGKAP MODUL RETAIL
        // ==========================================
        $catRetail = DocumentationCategory::create([
            'name' => 'Panduan Modul Retail',
            'slug' => 'panduan-modul-retail',
            'module' => 'retail',
            'order' => 3,
            'is_active' => true
        ]);

        DocumentationArticle::create([
            'category_id' => $catRetail->id,
            'title' => 'Alur Lengkap Menggunakan Modul Retail',
            'slug' => 'alur-lengkap-menggunakan-modul-retail',
            'short_description' => 'Dari input barang, manajemen stok gudang, hingga perhitungan transaksi di kasir POS.',
            'content' => '
                <p>Modul Retail didesain untuk kecepatan kasir dan akurasi stok gudang. Berikut adalah alur kerjanya:</p>

                <h2>1. Input Data Master (Barang & Supplier)</h2>
                <p>Sebelum bisa berjualan, Anda harus memasukkan data barang di menu <b>Katalog Produk</b>.</p>
                <ul>
                    <li><b>Informasi Dasar:</b> Masukkan SKU, Nama Barang, dan scan Barcode. Barcode sangat krusial untuk mempercepat proses di kasir.</li>
                    <li><b>Harga:</b> Tentukan Harga Modal (Harga Beli) dan Harga Jual (termasuk harga grosir jika ada bertingkat).</li>
                    <li><b>Varian:</b> Jika Anda berjualan baju, Anda bisa mengaktifkan opsi varian untuk membedakan Ukuran (S, M, L) dan Warna.</li>
                </ul>
                <p>Jangan lupa menambahkan data <b>Supplier</b> di menu Kontak agar Anda bisa melakukan pembelian kulakan.</p>

                <h2>2. Pembelian Barang & Tambah Stok (Purchasing)</h2>
                <p>Untuk menambah stok, alur yang benar di sistem adalah melalui menu <b>Pembelian (Purchase Order)</b>.</p>
                <ol>
                    <li>Buka menu Pembelian, klik <b>Buat PO Baru</b>.</li>
                    <li>Pilih Supplier tempat Anda membeli barang.</li>
                    <li>Masukkan daftar barang dan jumlah yang dibeli, sistem akan menghitung total tagihan.</li>
                    <li>Setelah barang fisik tiba di toko, staf gudang akan melakukan konfirmasi <b>Penerimaan Barang (Goods Receipt)</b>. Saat inilah stok barang di sistem baru akan bertambah secara otomatis.</li>
                </ol>

                <h2>3. Operasional Kasir (Point of Sale)</h2>
                <p>Setelah stok terisi, kasir siap melayani pembeli.</p>
                <ul>
                    <li><b>Buka Shift:</b> Di pagi hari, Kasir wajib "Membuka Shift" dan menginput nominal uang modal/receh (Cash in Drawer) yang ada di laci.</li>
                    <li><b>Transaksi:</b> Kasir cukup menggunakan scanner barcode atau mengetik nama produk. Jika pelanggan mengambil 5 barang yang sama, kasir dapat mengubah quantity-nya langsung.</li>
                    <li><b>Diskon & Pembayaran:</b> Kasir dapat memasukkan diskon (nominal atau persentase). Pembayaran bisa berupa Tunai, QRIS, atau Kartu Debit.</li>
                    <li><b>Cetak Struk:</b> Setelah transaksi sukses disubmit, sistem akan memotong stok secara otomatis, menyimpan data pemasukan, dan mencetak struk di printer thermal.</li>
                </ul>
                
                <h2>4. Tutup Shift & Penyetoran Kasir (Rumus)</h2>
                <p>Di penghujung hari kerja, Kasir melakukan <b>Tutup Shift</b>. Sistem akan mencocokkan total uang tunai yang seharusnya ada di laci (berdasarkan transaksi di sistem) dengan uang fisik yang dihitung oleh kasir.</p>
                <p>Sistem akan menghitung setoran uang fisik yang wajib disetorkan (Expected Cash) dengan rumus berikut:</p>
                <blockquote>Uang Setoran Wajib = Uang Modal Laci Pagi Hari + Total Transaksi Tunai Shift Ini - Pengeluaran Kasir</blockquote>
                <p>Selisih (jika ada) antara Uang Setoran Wajib dengan Uang Fisik aktual yang dihitung kasir akan dicatat sebagai <i>Shortage</i> (Kekurangan) atau <i>Overage</i> (Kelebihan).</p>
            ',
            'status' => 'published',
            'module' => 'retail',
            'published_at' => now(),
            'version' => '1.1'
        ]);

        DocumentationArticle::create([
            'category_id' => $catRetail->id,
            'title' => 'Panduan Laporan Margin & Profitabilitas Produk',
            'slug' => 'panduan-laporan-margin-profitabilitas-produk',
            'short_description' => 'Cara menganalisis laba kotor riil, HPP, persentase margin keuntungan, dan membaca diagram ranking produk.',
            'content' => '
                <p>Laporan Margin Produk diakses melalui menu <b>Laporan Margin Produk</b> di sidebar Retail. Fitur ini dirancang khusus untuk membedakan antara omzet kotor, modal barang (HPP), dan laba bersih riil per item yang terjual.</p>

                <h2>1. Mengapa Dipisahkan dari Katalog Produk?</h2>
                <p>Katalog Produk difokuskan untuk kecepatan operasional (kasir dan staf gudang). Demi keamanan data bisnis dan kerahasiaan persentase keuntungan dari kasir umum, analisis laba kotor dan HPP ditempatkan secara khusus di menu Laporan Margin dengan kontrol hak akses (RBAC).</p>

                <h2>2. Cara Membaca Status Margin</h2>
                <p>Sistem secara otomatis mengelompokkan kesehatan profitabilitas produk berdasarkan persentase margin:</p>
                <ul>
                    <li><b>Sangat Sehat (&ge; 30%):</b> Badge Hijau Tua (Produk penyumbang laba sangat tinggi).</li>
                    <li><b>Sehat (&ge; 20% - 29.9%):</b> Badge Hijau (Margin standar ritel yang aman).</li>
                    <li><b>Normal (&ge; 10% - 19.9%):</b> Badge Biru (Margin wajar untuk barang perputaran cepat/FMCG).</li>
                    <li><b>Tipis (&ge; 0% - 9.9%):</b> Badge Amber/Kuning (Margin tipis, perlu evaluasi harga kulakan atau harga jual).</li>
                    <li><b>Rugi (&lt; 0%):</b> Badge Merah (Harga jual di bawah HPP, segera perbaiki harga jual atau biaya pengadaan).</li>
                </ul>

                <h2>3. Diagram Horizontal Top 10 Produk</h2>
                <p>Pada bagian atas halaman laporan, sistem menampilkan grafik <b>Top 10 Produk Penyumbang Laba Kotor Terbesar</b>. Grafik horizontal memudahkan pembacaan nama produk dan menampilkan nilai Rupiah keuntungan riil.</p>

                <h2>4. Cetak & Ekspor Laporan</h2>
                <p>Anda dapat mencetak laporan dalam format dokumen resmi dengan mengklik tombol <b>Cetak Laporan</b> di kanan atas toolbar.</p>
            ',
            'status' => 'published',
            'module' => 'retail',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        DocumentationArticle::create([
            'category_id' => $catRetail->id,
            'title' => 'Panduan Akses Kasir Multi-Device (HP, Tablet, & PC) dalam Satu Wi-Fi',
            'slug' => 'panduan-akses-multi-device-wifi-lokal',
            'short_description' => 'Cara menghubungkan kasir dari smartphone atau tablet ke server komputer kasir lokal tanpa perlu konfigurasi IP manual.',
            'content' => '
                <p>Aplikasi Bizora mendukung akses kasir multi-device melalui jaringan Wi-Fi lokal secara otomatis.</p>

                <h2>1. Pastikan Perangkat Terhubung ke Wi-Fi yang Sama</h2>
                <p>Hubungkan HP, Tablet, atau Laptop kasir tambahan ke jaringan Wi-Fi / Hotspot yang sama dengan komputer utama (server).</p>

                <h2>2. Membuka Alamat Aplikasi di HP/Tablet</h2>
                <p>Di browser HP/Tablet (Chrome/Safari), ketik alamat IP komputer server diikuti port 5173 (contoh: <code>http://192.168.1.10:5173</code>).</p>
                <p>Sistem API akan secara otomatis mengenali IP server tanpa perlu melakukan perubahan setting konfigurasi (.env) berulang kali.</p>

                <h2>3. Login Akun Staf / Kasir</h2>
                <p>Gunakan akun staf kasir yang telah didaftarkan di menu <b>Manajemen Staf</b> untuk mulai melayani transaksi pelanggan.</p>
            ',
            'status' => 'published',
            'module' => 'retail',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        // ==========================================
        // 4. PANDUAN LENGKAP MODUL JASA
        // ==========================================
        $catJasa = DocumentationCategory::create([
            'name' => 'Panduan Modul Jasa',
            'slug' => 'panduan-modul-jasa',
            'module' => 'jasa',
            'order' => 4,
            'is_active' => true
        ]);

        DocumentationArticle::create([
            'category_id' => $catJasa->id,
            'title' => 'Alur Lengkap Menggunakan Modul Jasa',
            'slug' => 'alur-lengkap-menggunakan-modul-jasa',
            'short_description' => 'Penjelasan proses bisnis dari penerimaan servis, penugasan teknisi, hingga invoice akhir.',
            'content' => '
                <p>Modul Jasa berfokus pada pelacakan proses pengerjaan (workflow) yang membutuhkan waktu dan tenaga ahli (Teknisi).</p>

                <h2>1. Persiapan Katalog & Teknisi</h2>
                <p>Anda perlu mengkonfigurasi <b>Katalog Layanan</b> (Misal: Jasa Cuci AC, Ganti Layar HP, Cuci Sepatu Deep Clean). Tentukan harga estimasi standar untuk layanan tersebut.</p>
                <p>Selanjutnya, daftarkan para pekerja Anda di menu <b>Teknisi/Mekanik</b>. Hal ini berguna agar sistem bisa melacak beban kerja masing-masing orang.</p>

                <h2>2. Penerimaan Order (Work Order / SPK)</h2>
                <p>Ketika ada pelanggan datang membawa barang rusak atau menelepon untuk servis:</p>
                <ol>
                    <li>Admin/Frontdesk membuka menu <b>Work Order (SPK)</b> dan membuat dokumen baru.</li>
                    <li>Masukkan data pelanggan (Nama & No HP).</li>
                    <li>Deskripsikan keluhan pelanggan atau barang yang akan diservis (Misal: "AC Daikin 1 PK Kurang Dingin").</li>
                    <li>Admin menetapkan (assign) tugas tersebut ke salah satu <b>Teknisi</b>. Sistem akan merekam status order ini sebagai <b>PENDING</b> atau <b>MENUNGGU</b>.</li>
                </ol>

                <h2>3. Pengerjaan oleh Teknisi & Penambahan Sparepart</h2>
                <p>Teknisi akan mulai bekerja. Status diubah menjadi <b>IN PROGRESS (Sedang Dikerjakan)</b>.</p>
                <p>Jika saat pengerjaan ternyata membutuhkan suku cadang tambahan (Sparepart), Teknisi atau Admin dapat membuka kembali detail Work Order tersebut lalu menambahkan item sparepart (misal: "Kapasitor AC", "Freon"). Nilai total tagihan akan otomatis ter-update dan stok sparepart di gudang akan terpotong secara sistematis.</p>

                <h2>4. Penyelesaian & Invoice</h2>
                <p>Setelah pekerjaan beres, Teknisi menandai order sebagai <b>SELESAI (DONE)</b>.</p>
                <p>Pelanggan menuju kasir. Kasir membuka detail Work Order tersebut lalu mengonversinya menjadi <b>Invoice / Tagihan</b>. Setelah dibayar (via Cash/Transfer), transaksi dianggap selesai (Closed) dan masuk sebagai pendapatan jasa di Laporan Keuangan.</p>
            ',
            'status' => 'published',
            'module' => 'jasa',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        // ==========================================
        // 5. PANDUAN LENGKAP MODUL KULINER
        // ==========================================
        $catKuliner = DocumentationCategory::create([
            'name' => 'Panduan Modul Kuliner (F&B)',
            'slug' => 'panduan-modul-kuliner',
            'module' => 'kuliner',
            'order' => 5,
            'is_active' => true
        ]);

        DocumentationArticle::create([
            'category_id' => $catKuliner->id,
            'title' => 'Alur Operasional Resto, Manajemen Meja, & Resep',
            'slug' => 'alur-operasional-resto-dan-resep',
            'short_description' => 'Dari pengelolaan bahan mentah, pesanan per meja, hingga pencetakan tiket dapur beserta rumus HPP resep.',
            'content' => '
                <p>Modul Kuliner diformulasikan khusus untuk menangani kerumitan stok bahan mentah (bukan barang jadi) dan pesanan yang makan di tempat (Dine-in).</p>

                <h2>1. Mengelola Bahan Baku & Resep (BOM)</h2>
                <p>Tidak seperti Retail yang menjual barang utuh, F&B menjual barang jadi (Nasi Goreng) yang terdiri dari bahan mentah (Beras, Telur, Kecap).</p>
                <ul>
                    <li>Pertama, input seluruh bahan mentah Anda di menu <b>Bahan Baku (Ingredients)</b> (Contoh: Biji Kopi dalam satuan Gram).</li>
                    <li>Kedua, buat menu makanan/minuman Anda di <b>Katalog Menu</b>.</li>
                    <li>Ketiga, pasangkan <b>Resep</b> ke menu tersebut. Contoh: Untuk menu "Kopi Susu Gula Aren", masukkan komponen 15 gram Biji Kopi, 100 ml Susu, dan 20 gram Gula Aren.</li>
                </ul>

                <h2>2. Rumus BOM & Food Cost</h2>
                <p>Sistem akan otomatis memotong (deduksi) stok bahan baku di gudang sesaat setelah struk makanan dipesan.</p>
                <blockquote>Stok Akhir Susu = Stok Awal Susu - (Jumlah Porsi Terjual x Takaran Resep Susu)</blockquote>
                <p>Untuk mengetahui seberapa untung menu yang Anda jual, sistem menghitung Food Cost Percentage.</p>
                <blockquote>Harga Modal Menu = (Takaran Bahan A x HPP Bahan A) + (Takaran Bahan B x HPP Bahan B)</blockquote>
                <blockquote>Persentase Food Cost = (Harga Modal Menu / Harga Jual Menu di Buku) x 100%</blockquote>
                <p><i>Catatan:</i> Standar persentase food cost restoran yang sehat berada di angka 28% hingga 35%.</p>

                <h2>3. Konfigurasi Area & Meja</h2>
                <p>Masuk ke menu <b>Manajemen Meja</b>. Buat denah sederhana restoran Anda (Misal: Area Indoor Meja 1-10). Ini mempermudah pelayan mencatat lokasi pelanggan yang sedang makan.</p>

                <h2>4. Transaksi & Pembayaran</h2>
                <ol>
                    <li>Pelanggan duduk. Pelayan menghampiri dan mencatat pesanan menggunakan aplikasi dengan memilih <b>Nomor Meja</b>.</li>
                    <li>Setelah ditekan "Kirim Pesanan", pesanan tersebut akan otomatis terkirim (Struk Minuman ke Bar, Struk Makanan ke Dapur).</li>
                    <li>Setelah selesai makan, pelanggan menuju kasir dan menyebutkan nomor meja. Kasir menekan <b>Bayar</b>. Meja yang tadinya terkunci kini akan terbuka dan siap ditempati pelanggan baru.</li>
                </ol>
            ',
            'status' => 'published',
            'module' => 'kuliner',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        // ==========================================
        // 6. PANDUAN LENGKAP MODUL BUDIDAYA
        // ==========================================
        $catBudidaya = DocumentationCategory::create([
            'name' => 'Panduan Modul Budidaya',
            'slug' => 'panduan-modul-budidaya',
            'module' => 'budidaya',
            'order' => 6,
            'is_active' => true
        ]);

        DocumentationArticle::create([
            'category_id' => $catBudidaya->id,
            'title' => 'Mengawal Siklus Ternak/Tani Harian hingga Panen',
            'slug' => 'mengawal-siklus-ternak-tani-hingga-panen',
            'short_description' => 'Cara mencatat penebaran bibit, monitoring log harian, hingga kalkulasi evaluasi panen (FCR & SR).',
            'content' => '
                <p>Modul Budidaya dirancang untuk mencatat aktivitas pertumbuhan yang panjang (siklus berbulan-bulan) hingga menghasilkan laporan kinerja efisiensi panen.</p>

                <h2>1. Setup Kolam / Kandang / Lahan</h2>
                <p>Buat profil lokasi budidaya Anda di menu <b>Area Budidaya</b>. Tentukan kapasitas maksimal dari masing-masing area tersebut.</p>

                <h2>2. Memulai Siklus Produksi (Tebar Bibit)</h2>
                <p>Setiap kali Anda memasukkan bibit baru, Anda harus membuat <b>Siklus Produksi Baru</b>. Catat jumlah bibit (ekor) yang ditebar, tanggal penebaran, dan total biaya modal bibit tersebut.</p>

                <h2>3. Monitoring & Log Harian (Daily Records)</h2>
                <p>Setiap sore hari, pengurus harus mencatat <b>Log Harian</b>:</p>
                <ul>
                    <li><b>Pemberian Pakan:</b> Input berapa kilogram/gram pakan yang dihabiskan hari ini. Stok gudang pakan akan otomatis berkurang.</li>
                    <li><b>Mortalitas:</b> Catat jika ada hewan ternak yang mati pada hari tersebut agar estimasi populasi yang tersisa tetap akurat.</li>
                    <li><b>Perlakuan (Obat/Vitamin):</b> Catat biaya vitamin/obat (masuk ke dalam pembengkakan biaya modal HPP).</li>
                </ul>

                <h2>4. Panen (Harvesting) & Evaluasi Rumus FCR/SR</h2>
                <p>Ketika tiba waktunya, input total berat (Kilogram) hasil panen yang berhasil Anda peroleh (biomassa total) pada menu <b>Panen</b>. Sistem akan menghasilkan evaluasi dengan rumus berikut:</p>
                
                <h3>A. Survival Rate (Tingkat Kehidupan)</h3>
                <p>Metrik ini menunjukkan persentase jumlah populasi ternak/ikan yang berhasil hidup dari saat ditebar hingga hari H panen.</p>
                <blockquote>SR (%) = ((Populasi Awal - Total Angka Mortalitas) / Populasi Awal) x 100%</blockquote>
                
                <h3>B. FCR (Feed Conversion Ratio)</h3>
                <p><b>Semakin kecil angka FCR, semakin efisien dan untung peternakan tersebut</b> karena butuh sedikit pakan untuk menghasilkan banyak daging.</p>
                <blockquote>FCR = Total Pakan yang Dihabiskan (Kg) / (Total Berat Panen (Kg) - Berat Bibit Awal (Kg))</blockquote>
                <p><i>Contoh:</i> Selama siklus menghabiskan 1.500 Kg pakan. Berat panen 1.000 Kg. Maka FCR = 1.500 / 1.000 = <b>1.5</b>.</p>

                <h3>C. HPP Budidaya (Cost Per Kg)</h3>
                <blockquote>HPP per Kg = (Biaya Bibit + Total Biaya Pakan + Biaya Obat) / Total Berat Panen (Kg)</blockquote>
            ',
            'status' => 'published',
            'module' => 'budidaya',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        // ==========================================
        // 7. PANDUAN LENGKAP SELLER HUB
        // ==========================================
        $catSeller = DocumentationCategory::create([
            'name' => 'Panduan Seller Hub (Omnichannel)',
            'slug' => 'panduan-seller-hub',
            'module' => 'seller',
            'order' => 7,
            'is_active' => true
        ]);

        DocumentationArticle::create([
            'category_id' => $catSeller->id,
            'title' => 'Cara Sinkronisasi Stok Otomatis ke Banyak Marketplace',
            'slug' => 'sinkronisasi-stok-marketplace',
            'short_description' => 'Langkah-langkah menyatukan operasional Shopee, Tokopedia, & TikTok dalam satu dashboard.',
            'content' => '
                <p>Modul Seller Hub bertugas sebagai terminal pusat bagi pebisnis online yang berjualan di lebih dari satu platform marketplace agar stok tidak pernah jebol/bocor.</p>

                <h2>1. Integrasi API Akun Toko</h2>
                <p>Masuk ke menu <b>Integrasi Marketplace</b>. Di sana terdapat opsi untuk menyambungkan toko. Klik pada logo marketplace (Shopee, dll), lalu Anda akan diarahkan ke halaman login marketplace tersebut untuk memberikan izin (*Authorization*) kepada Bizora.</p>

                <h2>2. Mapping (Pencocokan) Produk</h2>
                <p>Anda wajib melakukan <b>Mapping SKU</b>. Sistem akan menarik seluruh daftar barang dari marketplace Anda ke dalam sistem Bizora. Anda cukup menjodohkan (link) produk dari marketplace tersebut dengan Produk Master (Gudang Pusat) di Bizora menggunakan SKU yang sama.</p>

                <h2>3. Sinkronisasi Stok (Stock Sync)</h2>
                <p>Setelah di-mapping, sistem *Auto-Sync* akan aktif.</p>
                <blockquote>Jika stok Sepatu Nike di gudang fisik Bizora (Modul Retail) Anda ubah dari 10 menjadi 8 (mungkin laku terjual di toko offline), maka Bizora akan mengirim sinyal otomatis ke Shopee, Tokopedia, dan Lazada dalam hitungan detik untuk mengubah stok produk mereka masing-masing menjadi 8.</blockquote>

                <h2>4. Pemrosesan Pesanan (Order Fulfillment)</h2>
                <ul>
                    <li>Semua orderan masuk dari berbagai sumber akan terkumpul menjadi satu antrean panjang di menu <b>Pesanan Masuk</b>.</li>
                    <li>Admin dapat mencentang puluhan order sekaligus dan mengeklik <b>Cetak Resi & Packing List Masal</b> (Mass Print).</li>
                    <li>Begitu barang dipacking dan diserahkan ke kurir, resi otomatis terupdate dan pendapatan akan tercatat di jurnal keuangan Bizora.</li>
                </ul>
            ',
            'status' => 'published',
            'module' => 'seller',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        // ==========================================
        // 8. SOP & OPERASIONAL SAAS ADMIN
        // ==========================================
        $catSopAdmin = DocumentationCategory::create([
            'name' => 'SOP & Operasional SaaS Admin',
            'slug' => 'sop-operasional-saas-admin',
            'module' => 'admin',
            'order' => 8,
            'is_active' => true
        ]);

        DocumentationArticle::create([
            'category_id' => $catSopAdmin->id,
            'title' => 'SOP Verifikasi Identitas & Dokumen Legalitas Tenant (KYC)',
            'slug' => 'sop-verifikasi-kyc-tenant',
            'short_description' => 'Standar operasional prosedur pemeriksaan kelengkapan identitas KTP, izin usaha NIB, dan persetujuan akun tenant.',
            'content' => '
                <p>Verifikasi <i>Know Your Customer</i> (KYC) wajib dilakukan oleh tim Administrator Bizora untuk memastikan bahwa setiap tenant yang menggunakan platform merupakan entitas bisnis nyata dan terhindar dari penyalahgunaan akun atau transaksi ilegal.</p>

                <h2>1. Dokumen yang Wajib Diverifikasi</h2>
                <p>Setiap calon tenant yang mendaftar dan mengajukan aktivasi wajib melampirkan berkas berikut melalui portal onboarding:</p>
                <ul>
                    <li><b>Identitas Pemilik/Penanggung Jawab:</b> Foto KTP/Paspor asli yang masih berlaku, tidak buram, NIK terbaca jelas, dan nama sesuai data profil akun.</li>
                    <li><b>Legalitas Usaha:</b> NIB (Nomor Induk Berusaha), SKU (Surat Keterangan Usaha) kelurahan, atau NPWP usaha/pribadi.</li>
                    <li><b>Dokumentasi Fisik Bisnis:</b> Foto plang nama toko/usaha, foto etalase/dapur/bengkel/lahan budidaya nyata yang menunjukkan aktivitas operasional.</li>
                </ul>

                <h2>2. Alur Pemeriksaan Tim Admin</h2>
                <ol>
                    <li>Buka menu <b>Verifikasi KYC Tenant</b> (<code>/kyc</code> atau <code>/admin/kyc</code>).</li>
                    <li>Pilih pengajuan berstatus <b>PENDING</b>.</li>
                    <li>Cek silang kesesuaian antara nama pemilik di formulir pendaftaran dengan KTP.</li>
                    <li>Pastikan masa berlaku dokumen legalitas masih aktif.</li>
                    <li>Lakukan validasi nomor telepon WhatsApp tenant untuk memastikan kontak dapat dihubungi.</li>
                </ol>

                <h2>3. Standar Pengambilan Keputusan</h2>
                <ul>
                    <li><b>Disetujui (Approved):</b> Berikan status verifikasi valid. Akun tenant otomatis memperoleh badge "Terverifikasi" dan seluruh limit pembatasan operasional dihilangkan.</li>
                    <li><b>Ditolak (Rejected):</b> Administrator <b>wajib</b> menuliskan catatan alasan penolakan secara spesifik (contoh: <i>"Foto KTP silau dan NIK tidak terbaca. Harap unggah ulang foto KTP dengan pencahayaan jelas."</i>). Notifikasi akan otomatis terkirim ke email tenant.</li>
                </ul>

                <h2>4. Service Level Agreement (SLA)</h2>
                <p>Waktu maksimal verifikasi dokumen KYC adalah <b>1 x 24 jam kerja</b> sejak berkas disubmit oleh tenant.</p>
            ',
            'status' => 'published',
            'module' => 'admin',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        DocumentationArticle::create([
            'category_id' => $catSopAdmin->id,
            'title' => 'SOP Manajemen Langganan, Faktur & Otomasi Pengingat Tagihan',
            'slug' => 'sop-manajemen-langganan-faktur-dan-otomasi',
            'short_description' => 'Prosedur validasi bukti pembayaran transfer manual, aktivasi paket, penerbitan invoice, dan jadwal otomasi pengingat.',
            'content' => '
                <p>Panduan tata kelola penagihan langganan (Subscription Lifecycle) untuk menjamin akurasi arus kas dan kelangsungan operasional bisnis tenant.</p>

                <h2>1. Siklus Status Langganan Tenant</h2>
                <ul>
                    <li><b>TRIAL (Uji Coba 14 Hari):</b> Diberikan otomatis saat tenant baru selesai mendaftar untuk eksplorasi fitur penuh.</li>
                    <li><b>ACTIVE (Berlangganan Aktif):</b> Langganan resmi berbayar bulanan atau tahunan. Akses terbuka penuh.</li>
                    <li><b>GRACE PERIOD (Masa Tenggang H+1 s/d H+3):</b> Masa toleransi setelah tanggal jatuh tempo. Fitur tetap aktif namun muncul banner pengingat tagihan pada dashboard tenant.</li>
                    <li><b>SUSPENDED (Tangguh / Kunci):</b> Berlaku pada H+4 jika tagihan belum diselesaikan. Tenant diarahkan ke halaman invoice dan tidak dapat memproses transaksi baru.</li>
                </ul>

                <h2>2. Prosedur Verifikasi Pembayaran Manual</h2>
                <ol>
                    <li>Buka menu <b>Permintaan Langganan</b> (<code>/subscription-requests</code>).</li>
                    <li>Periksa nomor invoice, nama tenant, dan jumlah transfer yang tercantum di bukti mutasi rekening bank Bizora.</li>
                    <li>Cocokkan nominal hingga 3 digit kode unik (jika menggunakan metode transfer manual).</li>
                    <li>Klik tombol <b>Aktivasi Paket</b>. Sistem secara otomatis memperpanjang masa berlaku tenant dan menandai invoice sebagai LUNAS.</li>
                </ol>

                <h2>3. Jadwal Otomasi Pengingat (Subscription Reminders)</h2>
                <p>Sistem pengingat otomatis di menu <b>Pengingat & Otomasi</b> berjalan setiap hari pada pukul 08:00 WIB:</p>
                <ul>
                    <li><b>H-7 Sebelum Jatuh Tempo:</b> Pengingat awal berisi rincian tagihan paket dan tautan pembayaran.</li>
                    <li><b>H-3 Sebelum Jatuh Tempo:</b> Notifikasi urgensi perpanjangan agar operasional kasir tidak terganggu.</li>
                    <li><b>H-1 Sebelum Jatuh Tempo:</b> Peringatan jatuh tempo besok hari.</li>
                    <li><b>H+3 Setelah Jatuh Tempo:</b> Peringatan batas akhir masa tenggang sebelum pembekuan akun.</li>
                </ul>
            ',
            'status' => 'published',
            'module' => 'admin',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        DocumentationArticle::create([
            'category_id' => $catSopAdmin->id,
            'title' => 'SOP Audit Keamanan Sistem, Log Aktivitas & Cadangan Data (Backup)',
            'slug' => 'sop-keamanan-audit-dan-backup',
            'short_description' => 'Prosedur pengawasan log aktivitas sensitif, rotasi kredensial administrator, dan kebijakan pencadangan database berkala.',
            'content' => '
                <p>Standar perlindungan data platform Bizora SaaS untuk mencegah kebocoran informasi dan menjamin pemulihan cepat saat terjadi gangguan.</p>

                <h2>1. Pengawasan Log Aktivitas & Audit (Audit Trail)</h2>
                <p>Menu <b>Log Aktivitas & Audit</b> (<code>/logs</code>) merekam seluruh interaksi krusial sistem:</p>
                <ul>
                    <li>Percobaan login gagal berulang kali (indikasi <i>brute-force</i>).</li>
                    <li>Penghapusan data tenant atau reset database.</li>
                    <li>Perubahan hak akses peran administrator (SaaS Roles).</li>
                    <li>Ekspor data sensitif pelanggan dalam format spreadsheet/Excel.</li>
                </ul>
                <p>Tim keamanan sistem wajib melakukan tinjauan berkala minimal <b>1 kali setiap pekan</b>.</p>

                <h2>2. Kebijakan Akun & Kredensial Administrator</h2>
                <ul>
                    <li>Setiap administrator wajib menggunakan akun personal dengan email korporat resmi. Dilarang berbagi akun (*shared credentials*).</li>
                    <li>Kata sandi wajib minimal 12 karakter kombinasi huruf besar, huruf kecil, angka, dan simbol.</li>
                    <li>Wajib melakukan rotasi password berkala setiap 90 hari.</li>
                </ul>

                <h2>3. Prosedur Cadangan Data (Backup)</h2>
                <p>Akses menu <b>Cadangan Data (Backup)</b> (<code>/backups</code>) untuk mengelola data cadangan:</p>
                <ul>
                    <li><b>Jadwal Otomatis:</b> Backup database penuh dieksekusi otomatis setiap hari pada pukul 02:00 WIB (dini hari saat beban traffic terendah).</li>
                    <li><b>Penyimpanan Terpisah:</b> Berkas dump database disimpan terenkripsi pada server penyimpanan off-site yang berbeda dari server aplikasi utama.</li>
                    <li><b>Uji Pemulihan (Drill Recovery):</b> Uji coba restorasi database cadangan ke server staging wajib dilakukan minimal 1 kali per kuartal untuk memastikan file dump valid dan tidak korup.</li>
                </ul>
            ',
            'status' => 'published',
            'module' => 'admin',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        // ==========================================
        // 9. STANDAR DESAIN & KONSISTENSI UI (DESIGN SYSTEM SOP)
        // ==========================================
        $catDesignSystem = DocumentationCategory::create([
            'name' => 'Standar Desain & Konsistensi UI',
            'slug' => 'standar-desain-sistem-ui',
            'module' => 'admin',
            'order' => 9,
            'is_active' => true
        ]);

        DocumentationArticle::create([
            'category_id' => $catDesignSystem->id,
            'title' => 'SOP Kamus Icon Terpusat (@/constants/icons)',
            'slug' => 'sop-kamus-icon-terpusat',
            'short_description' => 'Aturan resmi penggunaan kamus icon 225 aset visual, path alias terpusat, dan pedoman harmonisasi nama icon.',
            'content' => '
                <p>Untuk menjaga konsistensi visual, efisiensi ukuran bundle aplikasi, dan menghindari perbedaan versi icon antar-modul, seluruh pengembang Bizora wajib mematuhi SOP Kamus Icon.</p>

                <h2>1. Aturan Mutlak Import Icon</h2>
                <p><b>DILARANG</b> mengimpor icon secara langsung dari package eksternal <code>lucide-react</code> di dalam file komponen halaman!</p>
                <blockquote>
                    <b>SALAH:</b> <code>import { Search, Plus } from "lucide-react";</code><br>
                    <b>BENAR:</b> <code>import { Search, Plus } from "@/constants/icons";</code>
                </blockquote>

                <h2>2. Standar Harmonisasi Nama Icon (Resmi Bizora)</h2>
                <p>Untuk menghindari pemakaian icon yang berbeda fungsi untuk aksi yang sama, gunakan pedoman baku berikut:</p>
                <ul>
                    <li><b>Aksi Ubah / Edit:</b> Wajib menggunakan <code>Pencil</code> (dilarang menggunakan <code>Edit</code> atau <code>Edit3</code>).</li>
                    <li><b>Indikator Sukses / Centang:</b> Wajib menggunakan <code>CheckCircle2</code> (dilarang menggunakan <code>CheckCircle</code>).</li>
                    <li><b>Statistik / Grafik Batang:</b> Wajib menggunakan <code>BarChart2</code> (dilarang menggunakan <code>BarChart3</code>).</li>
                    <li><b>Peringatan / Alert:</b> Wajib menggunakan <code>AlertCircle</code> (dilarang menggunakan <code>CircleAlert</code>).</li>
                    <li><b>Penyaringan Data / Filter:</b> Wajib menggunakan <code>Filter</code> (dilarang menggunakan <code>ListFilter</code>).</li>
                </ul>

                <h2>3. Standar Ukuran (Size) & Garis (Stroke)</h2>
                <ul>
                    <li><b>Stroke Width:</b> Selalu gunakan default <code>strokeWidth={2}</code> untuk konsistensi ketebalan garis icon.</li>
                    <li><b>Ukuran 14px - 16px:</b> Digunakan pada tombol kompak (button icon), tag badge, dan inline text link.</li>
                    <li><b>Ukuran 18px - 20px:</b> Digunakan pada navigasi sidebar, menu tab, dan toolbar aksi tabel.</li>
                    <li><b>Ukuran 24px+:</b> Digunakan pada kartu statistik metrik (KPI Card) dan header banner modul.</li>
                </ul>

                <h2>4. Cara Mendaftarkan Icon Baru</h2>
                <p>Jika fitur Anda memerlukan icon baru yang belum tersedia:</p>
                <ol>
                    <li>Buka file <code>frontend/src/constants/icons.js</code>.</li>
                    <li>Tambahkan ekspor icon tersebut dari <code>lucide-react</code>.</li>
                    <li>Daftarkan nama, kategori, dan kata kunci pencariannya ke dalam <code>ICON_CATALOG</code> agar muncul pada menu <b>Kamus Icon UI</b> (<code>/admin/icon-dictionary</code>).</li>
                </ol>
            ',
            'status' => 'published',
            'module' => 'admin',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        DocumentationArticle::create([
            'category_id' => $catDesignSystem->id,
            'title' => 'SOP Standarisasi Kartu UI & Metrik KPI (Card Dictionary)',
            'slug' => 'sop-standarisasi-kartu-ui-kpi',
            'short_description' => 'Pedoman baku desain kartu metrik KPI, kontainer tabel data, form konfigurasi, dan token visual yang konsisten.',
            'content' => '
                <p>Kartu (Card) adalah fondasi tata letak antarmuka Bizora. Modul <b>Kamus Card UI</b> (<code>/admin/card-dictionary</code>) menyediakan cetak biru standar yang wajib diikuti.</p>

                <h2>1. Klasifikasi Jenis Kartu Standar</h2>
                <ul>
                    <li><b>Kartu Metrik KPI Stat:</b> Digunakan di baris teratas dashboard untuk menampilkan angka utama (Total Tenant, Omzet, Transaksi). Wajib memuat nilai metrik berukuran besar, label deskripsi, icon aksen latar bulat/persegi tumpul, serta indikator badge tren persentase kenaikan/penurunan.</li>
                    <li><b>Kartu Kontainer Tabel Data:</b> Membungkus tabel data utama. Wajib memiliki header yang terpisah rapi dengan judul tabel, deskripsi singkat, bilah pencarian, filter, dan tombol aksi (Tambah Data / Ekspor).</li>
                    <li><b>Kartu Formulir & Konfigurasi:</b> Mengelompokkan input pengaturan ke dalam blok-blok logis dengan judul seksi yang jelas dan tombol simpan di footer kartu.</li>
                    <li><b>Kartu Panduan & Info (Callout Card):</b> Berlatar aksen lembut (misal: Indigo-50 atau Emerald-50) dengan border kiri tebal untuk menonjolkan tips atau SOP penting.</li>
                </ul>

                <h2>2. Standar Token Desain Kartu</h2>
                <ul>
                    <li><b>Latar Belakang:</b> <code>bg-white</code> (Light Mode) / <code>dark:bg-slate-900</code> (Dark Mode).</li>
                    <li><b>Garis Tepi (Border):</b> <code>border border-slate-200</code> (Light Mode) / <code>dark:border-slate-800</code>. Hindari garis border gelap pekat.</li>
                    <li><b>Radius Sudut:</b> Standar utama adalah <code>rounded-2xl</code> (16px) untuk kartu kontainer dan KPI, serta <code>rounded-xl</code> (12px) untuk kartu sub-komponen.</li>
                    <li><b>Padding:</b> Gunakan padding proporsional <code>p-4 sm:p-6</code> agar tampilan tetap lega di layar mobile maupun desktop.</li>
                    <li><b>Bayangan (Shadow):</b> Gunakan <code>shadow-xs</code> atau <code>shadow-sm</code> yang halus. Dilarang menggunakan <code>shadow-2xl</code> pekat pada kartu kontainer statis.</li>
                </ul>
            ',
            'status' => 'published',
            'module' => 'admin',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        DocumentationArticle::create([
            'category_id' => $catDesignSystem->id,
            'title' => 'SOP Tipografi, Skala Font & Heading (Font Dictionary)',
            'slug' => 'sop-tipografi-skala-font-heading',
            'short_description' => 'Hierarki teks, skala ukuran font, bobot tulisan, dan panduan kontras warna teks di seluruh modul aplikasi.',
            'content' => '
                <p>Tipografi yang rapi menjamin keterbacaan data bisnis yang padat. Modul <b>Kamus Font & Tipografi</b> (<code>/admin/font-dictionary</code>) mengatur hierarki resmi tipografi Bizora.</p>

                <h2>1. Font Family Standar</h2>
                <p>Sistem menggunakan jenis font modern berkarakter ramah namun profesional:</p>
                <ul>
                    <li><b>Primer:</b> <code>Plus Jakarta Sans</code> (Font utama UI sistem).</li>
                    <li><b>Sekunder / Monospace:</b> <code>JetBrains Mono</code> atau font monospace sistem untuk kode SKU, NIK, Tenant ID, dan blok JSON.</li>
                </ul>

                <h2>2. Skala Hierarki Ukuran Font</h2>
                <ul>
                    <li><b>H1 Page Title (Judul Halaman):</b> Ukuran <code>22px - 24px</code>, Font Weight <code>700 (Bold)</code>, line-height 1.25.</li>
                    <li><b>H2 Section Title (Judul Seksi):</b> Ukuran <code>18px - 20px</code>, Font Weight <code>600 (Semibold)</code>.</li>
                    <li><b>H3 Card / Modal Title:</b> Ukuran <code>15px - 16px</code>, Font Weight <code>600 (Semibold)</code>.</li>
                    <li><b>Body Regular (Teks Umum):</b> Ukuran <code>13px - 14px</code>, Font Weight <code>400 (Regular)</code>, line-height 1.5.</li>
                    <li><b>Meta / Caption / Badge:</b> Ukuran <code>11px - 12px</code>, Font Weight <code>500 (Medium)</code> atau <code>600</code>.</li>
                </ul>

                <h2>3. Aturan Kontras Warna Teks</h2>
                <ul>
                    <li><b>Teks Utama (High Contrast):</b> <code>text-slate-900</code> (Light) / <code>dark:text-white</code>. Digunakan untuk heading dan nilai angka metrik.</li>
                    <li><b>Teks Sekunder (Medium Contrast):</b> <code>text-slate-600</code> (Light) / <code>dark:text-slate-300</code>. Digunakan untuk paragraf penjelasan dan isi tabel.</li>
                    <li><b>Teks Pudar / Muted:</b> <code>text-slate-400</code> (Light) / <code>dark:text-slate-500</code>. Digunakan untuk timestamp, placeholder, dan caption minor.</li>
                </ul>
            ',
            'status' => 'published',
            'module' => 'admin',
            'published_at' => now(),
            'version' => '1.0'
        ]);

        DocumentationArticle::create([
            'category_id' => $catDesignSystem->id,
            'title' => 'SOP Konvensi Navtop Header & Judul Halaman',
            'slug' => 'sop-konvensi-navtop-header-judul-halaman',
            'short_description' => 'Aturan sinkronisasi 100% judul halaman pada navtop header, sidebar menu, dan judul tab browser.',
            'content' => '
                <p>Pengguna mengandalkan judul pada bilah atas (navtop header) untuk mengetahui konteks modul yang sedang dibuka. SOP ini mengatur standarisasi judul halaman di SaaS Admin.</p>

                <h2>1. Aturan Sinkronisasi Judul Tiga Arah</h2>
                <p>Judul halaman harus selalu konsisten antara 3 elemen antarmuka:</p>
                <ol>
                    <li><b>Sidebar Menu (<code>Sidebar.jsx</code>):</b> Label menu yang diklik pengguna.</li>
                    <li><b>Navtop Header (<code>Header.jsx</code>):</b> Judul utama yang tampil di bilah atas aplikasi.</li>
                    <li><b>Tab Browser (<code>DocumentTitleHandler.jsx</code>):</b> Judul pada tab browser pengguna.</li>
                </ol>

                <h2>2. Larangan Fallback Default "Bizora SaaS"</h2>
                <p>Ketika menambahkan halaman baru di SaaS Admin, pengembang <b>wajib</b> mendaftarkan rute tersebut ke dalam <code>PAGE_TITLES</code> pada <code>Header.jsx</code> dan <code>ROUTE_TITLES</code> pada <code>DocumentTitleHandler.jsx</code>.</p>
                <blockquote>
                    <b>PERINGATAN:</b> Jangan biarkan rute tanpa entri mapping! Rute yang tidak terdaftar akan menampilkan judul fallback umum <i>"Bizora SaaS"</i> yang membingungkan pengguna (contoh kasus: halaman Kelola Dokumentasi).
                </blockquote>

                <h2>3. Standar Bahasa & Penamaan</h2>
                <ul>
                    <li>Gunakan Bahasa Indonesia baku yang ringkas dan jelas (contoh: gunakan <i>"Log Aktivitas & Audit"</i> daripada <i>"Security & Audit"</i>, gunakan <i>"Pengguna Platform"</i> daripada <i>"Users"</i>).</li>
                    <li>Sertakan teks deskripsi pendukung (<code>sub</code>) pada setiap entri <code>PAGE_TITLES</code> untuk melengkapi informasi fungsi halaman tersebut.</li>
                </ul>
            ',
            'status' => 'published',
            'module' => 'admin',
            'published_at' => now(),
            'version' => '1.0'
        ]);
    }
}
