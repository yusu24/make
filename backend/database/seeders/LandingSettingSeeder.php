<?php

namespace Database\Seeders;

use App\Models\LandingSetting;
use Illuminate\Database\Seeder;

class LandingSettingSeeder extends Seeder
{
    public function run(): void
    {
        LandingSetting::updateOrCreate(
            ['id' => 1],
            [
                'hero_title' => 'Kelola Bisnis UMKM',
                'hero_subtitle' => 'Lebih Cerdas & Mudah',
                'hero_desc' => 'Satu platform untuk retail, Budidaya Hewan, kuliner, dan jasa. Kelola stok, pesanan, laporan keuangan, dan pelanggan dalam satu genggaman.',
                'campaign_text' => 'Promo Spesial Kategori — Potongan Harga Upgrade Paket Aktif! Buat UMKM Anda naik tingkat. Hubungi admin untuk mendapatkan promo menarik per kategori bisnis Anda.',
                'campaign_active' => true,
                'show_sandbox' => true,
                'show_features' => true,
                'show_testimonials' => true,
                'featured_categories' => ['toko-retail', 'budidaya-hewan', 'budidaya-tanaman', 'kuliner'],
                'bank_name' => 'BANK BCA',
                'bank_account_no' => '8837 001 992',
                'bank_account_name' => 'PT Antigravity Global SaaS',
                'price_basic' => 149000,
                'price_pro' => 299000,
                'features_platform' => [
                    [
                        'icon' => '💳',
                        'title' => 'Kasir POS Fleksibel',
                        'tag' => 'Kasir Modern',
                        'description' => 'Mendukung pembayaran Tunai, QRIS, Kartu Debit/Kredit, dan Transfer Bank langsung dari kasir. Piutang pelanggan tercatat rapi lengkap dengan tanggal jatuh tempo.'
                    ],
                    [
                        'icon' => '📦',
                        'title' => 'Stok Auto-Sync & Peringatan Otomatis',
                        'tag' => 'Inventaris Presisi',
                        'description' => 'Stok berkurang otomatis saat ada penjualan dan kembali otomatis saat transaksi dibatalkan. Dapat notifikasi begitu stok barang mendekati batas minimum.'
                    ],
                    [
                        'icon' => '📊',
                        'title' => 'Laporan Otomatis Laba/Rugi',
                        'tag' => 'Keuangan Real-time',
                        'description' => 'Lihat Laporan Laba Rugi bersih, Omzet Harian, Produk Terlaris, dan Margin keuntungan tanpa ribet rumus Excel.'
                    ],
                    [
                        'icon' => '👥',
                        'title' => 'CRM & Program Loyalitas Pelanggan',
                        'tag' => 'Retensi Pelanggan',
                        'description' => 'Kelola basis data pelanggan setia lengkap dengan sistem poin belanja dan tier member (Regular/Silver/Gold) yang terhitung otomatis di setiap transaksi.'
                    ],
                    [
                        'icon' => '🛡️',
                        'title' => 'Hak Akses Granular per Staf',
                        'tag' => 'Kontrol Tim',
                        'description' => 'Atur hak akses spesifik untuk setiap staf — Kasir, Gudang, Supervisor, dan peran lainnya — per modul yang boleh diakses, langsung dari dashboard Owner.'
                    ],
                    [
                        'icon' => '🔔',
                        'title' => 'Notifikasi Real-time',
                        'tag' => 'Selalu Terupdate',
                        'description' => 'Dapat notifikasi otomatis langsung di dashboard begitu ada hal penting yang perlu ditindaklanjuti — dari stok menipis sampai transaksi masuk.'
                    ],
                ],
                'how_it_works_steps' => [
                    [
                        'icon' => '📝',
                        'title' => 'Registrasi Akun Dalam 1 Menit',
                        'description' => 'Daftar dengan nomor WhatsApp atau Email aktif. Tanpa perlu kartu kredit atau komitmen biaya awal.'
                    ],
                    [
                        'icon' => '⚙️',
                        'title' => 'Pilih Sektor Bisnis Anda',
                        'description' => 'Pilih apakah bisnis Anda berada di sektor Retail, Kuliner, Budidaya Perikanan/Ternak, atau Pertanian.'
                    ],
                    [
                        'icon' => '🚀',
                        'title' => 'Langsung Siap Operasional',
                        'description' => 'Sistem Bizora otomatis menyesuaikan tampilan modul. Mulai catat transaksi & pantau omzet dari HP!'
                    ],
                ],
                'faq_items' => [
                    [
                        'q' => 'Apakah saya bisa akses Bizora dari beberapa perangkat sekaligus?',
                        'a' => 'Bisa! Karena berbasis cloud, Anda tinggal login dari HP, tablet, atau laptop kapan saja dan datanya selalu tersinkron real-time antar perangkat — tidak perlu install aplikasi khusus, cukup buka browser. Saat ini Bizora membutuhkan koneksi internet aktif untuk mencatat transaksi.'
                    ],
                    [
                        'q' => 'Apakah saya wajib membeli mesin kasir atau printer mahal?',
                        'a' => 'Tidak perlu! Bizora dapat dijalankan di HP Android, iPhone, Tablet, maupun Laptop yang sudah Anda miliki. Anda cukup menyambungkan ke printer thermal Bluetooth murah (mulai dari Rp 100 ribuan) jika ingin mencetak struk fisik.'
                    ],
                    [
                        'q' => 'Bagaimana jika perangkat HP saya rusak atau hilang?',
                        'a' => 'Seluruh data transaksi dan stok Anda tersimpan aman secara terenkripsi di Cloud server Bizora. Jika HP Anda rusak, Anda tinggal login dengan akun Anda di HP baru, dan seluruh data akan langsung muncul kembali tanpa hilang.'
                    ],
                    [
                        'q' => 'Apakah saya bisa mengimpor data barang dari file Excel lama saya?',
                        'a' => 'Sangat bisa! Bizora menyediakan template impor Excel sederhana. Anda bisa langsung mengunggah ribuan nama produk, harga, dan jumlah stok hanya dalam hitungan detik.'
                    ],
                    [
                        'q' => 'Apakah saya bisa mengelola lebih dari 1 jenis bisnis (misal: Toko Retail sekaligus Kolam Ikan)?',
                        'a' => 'Bisa! Dengan 1 akun Bizora, Anda dapat berpindah antar sektor usaha dengan sangat mudah melalui menu ganti profil bisnis di dashboard.'
                    ],
                ],
                'roi_title' => 'Berapa Banyak Waktu & Biaya yang Bisa Anda Hemat Setiap Bulan?',
                'roi_desc' => 'Pencatatan kertas, pembukuan manual yang salah hitung, serta selisih stok yang misterius menguras jam kerja bernilai jutaan rupiah setiap bulannya.',
                'footer_brand_desc' => 'Platform bisnis digital #1 Indonesia untuk kelola toko retail, kuliner, serta budidaya hewan dan tanaman dalam satu aplikasi terpadu.',
                'footer_address' => 'Jakarta & Bandung, Indonesia',
                'footer_phone' => '+62 812-3456-7890 (CS WhatsApp 24/7)',
                'footer_email' => 'bantuan@bizora.id',
                'billing_email' => 'billing@bizora.id',
                'support_email' => 'support@bizora.id',
                'footer_security_text' => 'Bizora menggunakan infrastruktur cloud terenkripsi SSL 256-bit dengan backup otomatis harian.',
            ]
        );
    }
}
