<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\ApiKey;
use App\Models\LandingSetting;
use App\Models\PackageFeature;
use App\Models\SaasRole;
use App\Models\SupportTicket;
use App\Models\User;
use App\Models\Webhook;

class SaasAdminDummySeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();

        $admin = User::where('role', 'super_admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'super_admin', 'email' => 'admin_dummy@saas.com', 'status' => 'active']);
        }

        // 1. Activity Logs
        ActivityLog::truncate();
        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'login',
            'target' => 'System',
            'level' => 'info',
            'ip_address' => '127.0.0.1',
            'description' => 'Admin logged in',
        ]);
        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'update_tenant',
            'target' => 'TN-0001',
            'level' => 'warning',
            'ip_address' => '192.168.1.1',
            'description' => 'Updated tenant TN-0001 subscription plan to Pro',
        ]);
        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'delete_user',
            'target' => 'User ID 50',
            'level' => 'danger',
            'ip_address' => '10.0.0.5',
            'description' => 'Deleted inactive user ID 50',
        ]);

        // 2. Announcements
        Announcement::truncate();
        Announcement::create([
            'title' => 'Maintenance Server Terjadwal',
            'type' => 'maintenance',
            'target' => 'all',
            'status' => 'published',
            'content' => 'Akan ada maintenance pada tanggal 30 Juli 2026, harap maklum jika ada downtime selama 2 jam.',
            'date' => now()->toDateString(),
        ]);
        Announcement::create([
            'title' => 'Pembaruan Fitur Laporan',
            'type' => 'feature',
            'target' => 'pro',
            'status' => 'published',
            'content' => 'Fitur laporan kini dilengkapi dengan export PDF dan grafik harian.',
            'date' => now()->subDays(2)->toDateString(),
        ]);
        Announcement::create([
            'title' => 'Peringatan Masa Aktif Paket',
            'type' => 'promo',
            'target' => 'free',
            'status' => 'draft',
            'content' => 'Bagi pengguna paket Free, segera upgrade untuk menikmati fitur lengkap.',
            'date' => now()->addDays(5)->toDateString(),
        ]);

        // 3. SaaS Roles
        SaasRole::truncate();
        SaasRole::create([
            'name' => 'Finance Manager',
            'description' => 'Mengelola tagihan, invoice, dan laporan keuangan SaaS.',
            'permissions' => ['finance', 'reports'],
        ]);
        SaasRole::create([
            'name' => 'Support Staff',
            'description' => 'Menangani tiket dukungan dari pengguna.',
            'permissions' => ['support', 'tenants'],
        ]);
        SaasRole::create([
            'name' => 'Marketing',
            'description' => 'Mengatur promo dan pengaturan landing page.',
            'permissions' => ['landing_settings', 'announcements'],
        ]);

        // 4. ApiKey & Webhook
        ApiKey::truncate();
        ApiKey::create([
            'name' => 'Mobile App Integration API',
            'key_prefix' => 'sk_live_123',
            'hashed_key' => bcrypt('secretkey_live'),
            'last_used_at' => now()->subHours(2),
            'created_by' => $admin->id,
        ]);
        ApiKey::create([
            'name' => 'Payment Gateway Webhook',
            'key_prefix' => 'sk_test_456',
            'hashed_key' => bcrypt('secretkey_test'),
            'last_used_at' => null,
            'created_by' => $admin->id,
        ]);

        Webhook::truncate();
        Webhook::create([
            'url' => 'https://api.example.com/webhook/payment',
            'is_active' => true,
            'created_by' => $admin->id,
        ]);
        Webhook::create([
            'url' => 'https://api.example.com/webhook/tenant-registered',
            'is_active' => false,
            'created_by' => $admin->id,
        ]);

        // 5. Landing Settings (update or create)
        LandingSetting::updateOrCreate(
            ['id' => 1],
            [
                'hero_title' => 'Solusi Manajemen UMKM Digital Terbaik',
                'hero_subtitle' => 'Kelola bisnis retail, kuliner, dan budidaya dalam satu aplikasi',
                'hero_desc' => 'Tingkatkan produktivitas bisnis Anda dengan fitur terlengkap.',
                'campaign_text' => 'Diskon 50% untuk langganan tahunan! Gunakan kode: MERDEKA50',
                'campaign_active' => true,
                'show_sandbox' => true,
                'show_features' => true,
                'show_testimonials' => true,
                'featured_categories' => ['Toko Retail', 'Kuliner', 'Budidaya Ikan'],
                'bank_name' => 'BCA',
                'bank_account_no' => '1234567890',
                'bank_account_name' => 'PT UMKM Digital Nusantara',
                'price_basic' => 149000,
                'price_pro' => 299000,
            ]
        );

        // 6. Package Features
        PackageFeature::truncate();
        PackageFeature::create([
            'title' => 'Multi Cabang / Outlet',
            'description' => 'Kelola banyak outlet dalam satu akun.',
            'icon' => 'Store',
        ]);
        PackageFeature::create([
            'title' => 'Laporan Lengkap',
            'description' => 'Laporan keuangan, stok, dan kasir lengkap.',
            'icon' => 'BarChart2',
        ]);
        PackageFeature::create([
            'title' => 'Dukungan Prioritas',
            'description' => 'Layanan bantuan 24/7.',
            'icon' => 'Headphones',
        ]);

        // 7. Support Tickets
        SupportTicket::truncate();
        SupportTicket::create([
            'id' => SupportTicket::generateId(),
            'tenant_id' => 'TN-RETAIL',
            'name' => 'Ahmad',
            'subject' => 'Kendala cetak struk kasir Bluetooth',
            'description' => 'Printer kasir saya tidak bisa terhubung via bluetooth di HP Android.',
            'category' => 'bug',
            'priority' => 'high',
            'status' => 'open',
            'assigned' => null,
        ]);
        SupportTicket::create([
            'id' => SupportTicket::generateId(),
            'tenant_id' => 'TN-BUDIDAYA',
            'name' => 'Siti',
            'subject' => 'Cara tambah kolam baru',
            'description' => 'Saya baru langganan pro, bagaimana cara tambah kolam lebih dari 5?',
            'category' => 'question',
            'priority' => 'medium',
            'status' => 'in_progress',
            'assigned' => 'Support Staff B',
        ]);
        SupportTicket::create([
            'id' => SupportTicket::generateId(),
            'tenant_id' => 'TN-KULINER',
            'name' => 'Dewi',
            'subject' => 'Salah potong saldo E-Wallet',
            'description' => 'Ada transaksi ganda di pembayaran E-Wallet kasir.',
            'category' => 'billing',
            'priority' => 'high',
            'status' => 'resolved',
            'assigned' => 'Finance Staff A',
        ]);

        $this->command->info('✅ SaaS Admin Dummy Data Seeded Successfully!');
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    }
}
