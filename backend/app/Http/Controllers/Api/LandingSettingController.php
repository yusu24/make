<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\LandingSetting;
use Illuminate\Http\Request;

class LandingSettingController extends Controller
{
    public function get()
    {
        $settings = LandingSetting::first();
        if (!$settings) {
            $settings = LandingSetting::create([
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
                'features_platform' => self::defaultFeaturesPlatform(),
                'how_it_works_steps' => self::defaultHowItWorksSteps(),
                'faq_items' => self::defaultFaqItems(),
                'roi_title' => 'Berapa Banyak Waktu & Biaya yang Bisa Anda Hemat Setiap Bulan?',
                'roi_desc' => 'Pencatatan kertas, pembukuan manual yang salah hitung, serta selisih stok yang misterius menguras jam kerja bernilai jutaan rupiah setiap bulannya.',
                'footer_brand_desc' => 'Platform bisnis digital #1 Indonesia untuk kelola toko retail, kuliner, serta budidaya hewan dan tanaman dalam satu aplikasi terpadu.',
                'footer_address' => 'Jakarta & Bandung, Indonesia',
                'footer_phone' => '+62 812-3456-7890 (CS WhatsApp 24/7)',
                'footer_email' => 'bantuan@bizora.id',
                'footer_security_text' => 'Bizora menggunakan infrastruktur cloud terenkripsi SSL 256-bit dengan backup otomatis harian.',
            ]);
        }
        return response()->json(['success' => true, 'data' => $settings]);
    }

    private static function defaultFeaturesPlatform(): array
    {
        return [
            ['icon' => '💳', 'title' => 'Kasir POS Fleksibel', 'tag' => 'Kasir Modern', 'description' => 'Mendukung pembayaran Tunai, QRIS, Kartu Debit/Kredit, dan Transfer Bank langsung dari kasir. Piutang pelanggan tercatat rapi lengkap dengan tanggal jatuh tempo.'],
            ['icon' => '📦', 'title' => 'Stok Auto-Sync & Peringatan Otomatis', 'tag' => 'Inventaris Presisi', 'description' => 'Stok berkurang otomatis saat ada penjualan dan kembali otomatis saat transaksi dibatalkan. Dapat notifikasi begitu stok barang mendekati batas minimum.'],
            ['icon' => '📊', 'title' => 'Laporan Otomatis Laba/Rugi', 'tag' => 'Keuangan Real-time', 'description' => 'Lihat Laporan Laba Rugi bersih, Omzet Harian, Produk Terlaris, dan Margin keuntungan tanpa ribet rumus Excel.'],
            ['icon' => '👥', 'title' => 'CRM & Program Loyalitas Pelanggan', 'tag' => 'Retensi Pelanggan', 'description' => 'Kelola basis data pelanggan setia lengkap dengan sistem poin belanja dan tier member (Regular/Silver/Gold) yang terhitung otomatis di setiap transaksi.'],
            ['icon' => '🛡️', 'title' => 'Hak Akses Granular per Staf', 'tag' => 'Kontrol Tim', 'description' => 'Atur hak akses spesifik untuk setiap staf — Kasir, Gudang, Supervisor, dan peran lainnya — per modul yang boleh diakses, langsung dari dashboard Owner.'],
            ['icon' => '🔔', 'title' => 'Notifikasi Real-time', 'tag' => 'Selalu Terupdate', 'description' => 'Dapat notifikasi otomatis langsung di dashboard begitu ada hal penting yang perlu ditindaklanjuti — dari stok menipis sampai transaksi masuk.'],
        ];
    }

    private static function defaultHowItWorksSteps(): array
    {
        return [
            ['icon' => '📝', 'title' => 'Registrasi Akun Dalam 1 Menit', 'description' => 'Daftar dengan nomor WhatsApp atau Email aktif. Tanpa perlu kartu kredit atau komitmen biaya awal.'],
            ['icon' => '⚙️', 'title' => 'Pilih Sektor Bisnis Anda', 'description' => 'Pilih apakah bisnis Anda berada di sektor Retail, Kuliner, Budidaya Perikanan/Ternak, atau Pertanian.'],
            ['icon' => '🚀', 'title' => 'Langsung Siap Operasional', 'description' => 'Sistem Bizora otomatis menyesuaikan tampilan modul. Mulai catat transaksi & pantau omzet dari HP!'],
        ];
    }

    private static function defaultFaqItems(): array
    {
        return [
            ['q' => 'Apakah saya bisa akses Bizora dari beberapa perangkat sekaligus?', 'a' => 'Bisa! Karena berbasis cloud, Anda tinggal login dari HP, tablet, atau laptop kapan saja dan datanya selalu tersinkron real-time antar perangkat — tidak perlu install aplikasi khusus, cukup buka browser. Saat ini Bizora membutuhkan koneksi internet aktif untuk mencatat transaksi.'],
            ['q' => 'Apakah saya wajib membeli mesin kasir atau printer mahal?', 'a' => 'Tidak perlu! Bizora dapat dijalankan di HP Android, iPhone, Tablet, maupun Laptop yang sudah Anda miliki. Anda cukup menyambungkan ke printer thermal Bluetooth murah (mulai dari Rp 100 ribuan) jika ingin mencetak struk fisik.'],
            ['q' => 'Bagaimana jika perangkat HP saya rusak atau hilang?', 'a' => 'Seluruh data transaksi dan stok Anda tersimpan aman secara terenkripsi di Cloud server Bizora. Jika HP Anda rusak, Anda tinggal login dengan akun Anda di HP baru, dan seluruh data akan langsung muncul kembali tanpa hilang.'],
            ['q' => 'Apakah saya bisa mengimpor data barang dari file Excel lama saya?', 'a' => 'Sangat bisa! Bizora menyediakan template impor Excel sederhana. Anda bisa langsung mengunggah ribuan nama produk, harga, dan jumlah stok hanya dalam hitungan detik.'],
            ['q' => 'Apakah saya bisa mengelola lebih dari 1 jenis bisnis (misal: Toko Retail sekaligus Kolam Ikan)?', 'a' => 'Bisa! Dengan 1 akun Bizora, Anda dapat berpindah antar sektor usaha dengan sangat mudah melalui menu ganti profil bisnis di dashboard.'],
        ];
    }

    public function update(Request $request)
    {
        $settings = LandingSetting::first();
        if (!$settings) {
            $settings = new LandingSetting();
        }

        $settings->fill([
            'hero_title'       => $request->hero_title ?? $settings->hero_title ?? 'Kelola Bisnis UMKM',
            'hero_subtitle'    => $request->hero_subtitle ?? $settings->hero_subtitle ?? 'Lebih Cerdas & Mudah',
            'hero_desc'        => $request->has('hero_desc') ? $request->hero_desc : $settings->hero_desc,
            'campaign_text'    => $request->has('campaign_text') ? $request->campaign_text : $settings->campaign_text,
            'campaign_active'  => $request->has('campaign_active') ? filter_var($request->campaign_active, FILTER_VALIDATE_BOOLEAN) : $settings->campaign_active,
            'show_sandbox'     => $request->has('show_sandbox') ? filter_var($request->show_sandbox, FILTER_VALIDATE_BOOLEAN) : $settings->show_sandbox,
            'show_features'    => $request->has('show_features') ? filter_var($request->show_features, FILTER_VALIDATE_BOOLEAN) : $settings->show_features,
            'show_testimonials'=> $request->has('show_testimonials') ? filter_var($request->show_testimonials, FILTER_VALIDATE_BOOLEAN) : $settings->show_testimonials,
            'featured_categories'=> $request->has('featured_categories') ? $request->featured_categories : $settings->featured_categories,
            'bank_name'        => $request->has('bank_name') ? $request->bank_name : $settings->bank_name,
            'bank_account_no'  => $request->has('bank_account_no') ? $request->bank_account_no : $settings->bank_account_no,
            'bank_account_name'=> $request->has('bank_account_name') ? $request->bank_account_name : $settings->bank_account_name,
            'price_basic'      => $request->has('price_basic') ? intval($request->price_basic) : $settings->price_basic,
            'price_pro'        => $request->has('price_pro') ? intval($request->price_pro) : $settings->price_pro,
            'features_platform'  => $request->has('features_platform') ? $request->features_platform : $settings->features_platform,
            'how_it_works_steps' => $request->has('how_it_works_steps') ? $request->how_it_works_steps : $settings->how_it_works_steps,
            'faq_items'          => $request->has('faq_items') ? $request->faq_items : $settings->faq_items,
            'roi_title'          => $request->has('roi_title') ? $request->roi_title : $settings->roi_title,
            'roi_desc'           => $request->has('roi_desc') ? $request->roi_desc : $settings->roi_desc,
            'footer_brand_desc'    => $request->has('footer_brand_desc') ? $request->footer_brand_desc : $settings->footer_brand_desc,
            'footer_address'       => $request->has('footer_address') ? $request->footer_address : $settings->footer_address,
            'footer_phone'         => $request->has('footer_phone') ? $request->footer_phone : $settings->footer_phone,
            'footer_email'         => $request->has('footer_email') ? $request->footer_email : $settings->footer_email,
            'billing_email'        => $request->has('billing_email') ? $request->billing_email : $settings->billing_email,
            'support_email'        => $request->has('support_email') ? $request->support_email : $settings->support_email,
            'footer_security_text' => $request->has('footer_security_text') ? $request->footer_security_text : $settings->footer_security_text,
        ]);

        $settings->save();

        ActivityLog::record('update_landing_settings', 'Pengaturan Portal diperbarui', 'info');

        return response()->json(['success' => true, 'message' => 'Pengaturan portal berhasil diperbarui', 'data' => $settings]);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'type' => 'required|in:admin,landing',
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
        ]);

        $settings = LandingSetting::first();
        if (!$settings) {
            $settings = LandingSetting::create([
                'hero_title' => 'Kelola Bisnis Anda',
                'hero_subtitle' => 'Lebih Cerdas & Mudah',
                'hero_desc' => 'Satu platform untuk retail, Budidaya Hewan, kuliner, dan jasa.',
            ]);
        }

        $type = $request->type;
        $file = $request->file('file');
        
        // Store in storage/app/public/logos
        $path = $file->store('logos', 'public');

        // Delete old file if exists
        if ($type === 'admin' && $settings->admin_logo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->admin_logo_path);
        } elseif ($type === 'landing' && $settings->landing_logo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->landing_logo_path);
        }

        // Update database
        $settings->update([
            $type . '_logo_path' => $path
        ]);

        ActivityLog::record('upload_logo', 'Logo portal (' . $type . ') diperbarui', 'info');

        return response()->json([
            'success' => true,
            'message' => 'Logo berhasil diunggah',
            'data' => [
                'path' => $path,
                'url' => url('storage/' . $path)
            ]
        ]);
    }

    public function resetLogo(Request $request)
    {
        $request->validate([
            'type' => 'required|in:admin,landing',
        ]);

        $settings = LandingSetting::first();
        if ($settings) {
            $type = $request->type;
            if ($type === 'admin' && $settings->admin_logo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->admin_logo_path);
                $settings->update(['admin_logo_path' => null]);
            } elseif ($type === 'landing' && $settings->landing_logo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->landing_logo_path);
                $settings->update(['landing_logo_path' => null]);
            }
        }

        ActivityLog::record('reset_logo', 'Logo portal (' . $request->type . ') dikembalikan ke default', 'info');

        return response()->json([
            'success' => true,
            'message' => 'Logo berhasil dikembalikan ke default',
            'data' => $settings
        ]);
    }
}
