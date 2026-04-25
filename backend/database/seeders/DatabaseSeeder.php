<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Business Categories ───────────────────────────────────────────
        $categories = [
            ['name' => 'Toko Retail',   'slug' => 'toko-retail',   'description' => 'Manajemen stok & penjualan toko fisik/online', 'icon' => '🛒', 'color' => '#3b82f6', 'sort_order' => 1],
            ['name' => 'Budidaya Ikan', 'slug' => 'budidaya-ikan', 'description' => 'Pemantauan kolam ikan & siklus panen',          'icon' => '🐟', 'color' => '#10b981', 'sort_order' => 2],
            ['name' => 'Jasa',          'slug' => 'jasa',          'description' => 'Manajemen booking & layanan jasa',              'icon' => '🔧', 'color' => '#8b5cf6', 'sort_order' => 3],
            ['name' => 'Manufaktur',    'slug' => 'manufaktur',    'description' => 'Kontrol produksi & manajemen bahan baku',       'icon' => '🏭', 'color' => '#f59e0b', 'sort_order' => 4],
            ['name' => 'Kuliner',       'slug' => 'kuliner',       'description' => 'Manajemen restoran & kasir digital',            'icon' => '🍱', 'color' => '#ef4444', 'sort_order' => 5],
        ];

        foreach ($categories as $cat) {
            BusinessCategory::firstOrCreate(['slug' => $cat['slug']], $cat + ['active' => true]);
        }

        // ─── Super Admin ───────────────────────────────────────────────────
        $superAdmin = User::firstOrCreate(['email' => 'admin@umkm.com'], [
            'name'     => 'Super Admin',
            'password' => Hash::make('password'),
            'role'     => 'super_admin',
            'status'   => 'active',
        ]);

        // ─── Admin ─────────────────────────────────────────────────────────
        $admin = User::firstOrCreate(['email' => 'rizka@saas.com'], [
            'name'     => 'Rizka Admin',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'status'   => 'active',
        ]);

        // ─── Sample Customers ──────────────────────────────────────────────
        $retailCat  = BusinessCategory::where('slug', 'toko-retail')->first();
        $fishCat    = BusinessCategory::where('slug', 'budidaya-ikan')->first();
        $jasaCat    = BusinessCategory::where('slug', 'jasa')->first();
        $mftrCat    = BusinessCategory::where('slug', 'manufaktur')->first();

        $customers = [
            ['name' => 'Ahmad Suharto',  'email' => 'ahmad@retail.com', 'category' => $retailCat, 'plan' => 'pro'],
            ['name' => 'Siti Rahayu',    'email' => 'siti@ikan.com',    'category' => $fishCat,   'plan' => 'basic'],
            ['name' => 'Budi Santoso',   'email' => 'budi@jasa.com',    'category' => $jasaCat,   'plan' => 'free'],
            ['name' => 'Dewi Lestari',   'email' => 'dewi@mftr.com',    'category' => $mftrCat,   'plan' => 'pro'],
            ['name' => 'Demo Customer',  'email' => 'customer@umkm.com','category' => $retailCat, 'plan' => 'basic'],
        ];

        foreach ($customers as $i => $c) {
            $user = User::firstOrCreate(['email' => $c['email']], [
                'name'                 => $c['name'],
                'password'             => Hash::make('password'),
                'role'                 => 'customer',
                'status'               => 'active',
                'business_category_id' => $c['category']?->id,
            ]);

            if ($c['category']) {
                Tenant::firstOrCreate(['user_id' => $user->id], [
                    'tenant_id'            => 'TN-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                    'business_category_id' => $c['category']->id,
                    'business_name'        => $c['name'],
                    'subscription_plan'    => $c['plan'],
                    'status'               => 'active',
                    'trial_ends_at'        => now()->addDays(14),
                ]);
            }
        }

        $this->command->info('✅ Database seeded successfully!');
        $this->command->info('   Super Admin: admin@umkm.com / password');
        $this->command->info('   Customer:    customer@umkm.com / password');
    }
}
