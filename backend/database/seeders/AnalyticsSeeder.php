<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\MonthlyRevenue;
use App\Models\PlanDistribution;
use App\Models\CategoryDistribution;
use App\Models\TopTenant;
use App\Models\TenantInvoice;
use App\Models\SubscriptionRequest;

class AnalyticsSeeder extends Seeder
{
    /**
     * Run the database seeds to populate SaaS Admin reports and billing lists.
     */
    public function run(): void
    {
        // 1. Truncate existing mock tables
        MonthlyRevenue::truncate();
        PlanDistribution::truncate();
        CategoryDistribution::truncate();
        TopTenant::truncate();
        
        // Truncate SaaS invoices & upgrade requests for clean demo
        TenantInvoice::truncate();
        SubscriptionRequest::truncate();

        // 2. Populate Monthly Revenue (Akumulasi Pendapatan SaaS)
        MonthlyRevenue::insert([
            ['year' => 2026, 'month' => 1, 'amount' => 12500000],
            ['year' => 2026, 'month' => 2, 'amount' => 18200000],
            ['year' => 2026, 'month' => 3, 'amount' => 24500000],
            ['year' => 2026, 'month' => 4, 'amount' => 35140000],
            ['year' => 2026, 'month' => 5, 'amount' => 42000000],
        ]);

        // 3. Populate Plan Distribution
        PlanDistribution::insert([
            ['plan_name' => 'Free', 'tenant_count' => 12],
            ['plan_name' => 'Basic', 'tenant_count' => 18],
            ['plan_name' => 'Pro', 'tenant_count' => 15],
        ]);

        // 4. Populate Category Distribution
        CategoryDistribution::insert([
            ['category_name' => 'Retail', 'count' => 21],
            ['category_name' => 'F&B', 'count' => 15],
            ['category_name' => 'Jasa', 'count' => 9],
        ]);

        // 5. Populate Top Tenants
        TopTenant::insert([
            ['name' => 'Toko Maju Jaya', 'plan' => 'Pro', 'category' => 'Retail', 'revenue' => 2500000, 'joined' => '12 Jan 2026'],
            ['name' => 'Warteg Bahagia', 'plan' => 'Basic', 'category' => 'F&B', 'revenue' => 1200000, 'joined' => '05 Feb 2026'],
            ['name' => 'Laundry Bersih', 'plan' => 'Pro', 'category' => 'Jasa', 'revenue' => 1800000, 'joined' => '20 Mar 2026'],
            ['name' => 'Klinik Sehat', 'plan' => 'Pro', 'category' => 'Jasa', 'revenue' => 3500000, 'joined' => '01 Apr 2026'],
            ['name' => 'Cafe Senja', 'plan' => 'Basic', 'category' => 'F&B', 'revenue' => 2100000, 'joined' => '15 May 2026'],
        ]);

        // 6. Populate Tenant Invoices (Paid, Unpaid, Overdue)
        $invoices = [
            // Paid Invoices (Lunas)
            [
                'id' => 'INV-2026010001',
                'tenant_id' => 'TN-RETAIL',
                'plan' => 'pro',
                'amount' => 299000.00,
                'status' => 'paid',
                'date' => '2026-01-05',
                'due_date' => '2026-01-12',
                'paid_at' => '2026-01-06 10:15:00',
            ],
            [
                'id' => 'INV-2026020001',
                'tenant_id' => 'TN-BUDIDAYA',
                'plan' => 'basic',
                'amount' => 149000.00,
                'status' => 'paid',
                'date' => '2026-02-10',
                'due_date' => '2026-02-17',
                'paid_at' => '2026-02-12 14:30:00',
            ],
            [
                'id' => 'INV-2026030001',
                'tenant_id' => 'TN-KULINER',
                'plan' => 'pro',
                'amount' => 299000.00,
                'status' => 'paid',
                'date' => '2026-03-01',
                'due_date' => '2026-03-08',
                'paid_at' => '2026-03-02 09:00:00',
            ],
            [
                'id' => 'INV-2026040001',
                'tenant_id' => 'TN-TANAMAN',
                'plan' => 'basic',
                'amount' => 149000.00,
                'status' => 'paid',
                'date' => '2026-04-12',
                'due_date' => '2026-04-19',
                'paid_at' => '2026-04-13 16:45:00',
            ],

            // Unpaid Invoices (Belum Bayar)
            [
                'id' => 'INV-2026050001',
                'tenant_id' => 'TN-RETAIL',
                'plan' => 'pro',
                'amount' => 299000.00,
                'status' => 'unpaid',
                'date' => '2026-05-10',
                'due_date' => '2026-05-25', // Future or recent due date
                'paid_at' => null,
            ],
            [
                'id' => 'INV-2026050002',
                'tenant_id' => 'TN-KULINER',
                'plan' => 'pro',
                'amount' => 299000.00,
                'status' => 'unpaid',
                'date' => '2026-05-12',
                'due_date' => '2026-05-27',
                'paid_at' => null,
            ],

            // Overdue Invoices (Jatuh Tempo)
            [
                'id' => 'INV-2026040002',
                'tenant_id' => 'TN-0002',
                'plan' => 'pro',
                'amount' => 299000.00,
                'status' => 'overdue',
                'date' => '2026-04-01',
                'due_date' => '2026-04-15', // Past due date
                'paid_at' => null,
            ],
            [
                'id' => 'INV-2026040003',
                'tenant_id' => 'TN-0005',
                'plan' => 'basic',
                'amount' => 149000.00,
                'status' => 'overdue',
                'date' => '2026-04-05',
                'due_date' => '2026-04-19', // Past due date
                'paid_at' => null,
            ],
        ];

        foreach ($invoices as $inv) {
            TenantInvoice::create($inv);
        }

        // 7. Populate Subscription Upgrade Requests (Permintaan Upgrade)
        $requests = [
            [
                'tenant_id' => 'TN-0001',
                'plan' => 'Pro',
                'notes' => 'Sudah transfer lewat M-Banking BCA, bukti terlampir.',
                'status' => 'pending',
                'created_at' => now()->subHours(10),
                'updated_at' => now()->subHours(10),
            ],
            [
                'tenant_id' => 'TN-0002',
                'plan' => 'Basic',
                'notes' => 'Pengajuan upgrade paket budidaya untuk 3 kolam tambahan.',
                'status' => 'pending',
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ],
            [
                'tenant_id' => 'TN-0003',
                'plan' => 'Pro',
                'notes' => 'Ingin menggunakan fitur multi-lahan terintegrasi.',
                'status' => 'pending',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
        ];

        foreach ($requests as $req) {
            SubscriptionRequest::create($req);
        }
    }
}
