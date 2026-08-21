<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\JasaService;
use App\Models\JasaTechnician;
use App\Models\JasaWorkOrder;
use App\Models\JasaOrderPart;
use App\Models\JasaWorkOrderLog;
use App\Models\JasaContract;
use App\Models\JasaFinanceTransaction;
use App\Models\JasaSparepart;

class JasaModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 'TN-JASA';

        // 1. Seed Jasa Services (Katalog)
        $services = [
            [
                'tenant_id' => $tenantId,
                'code' => 'SVC-AC-001',
                'name' => 'Cuci AC Split Standard 0.5 - 1 PK',
                'category' => 'Maintenance',
                'description' => 'Pembersihan unit indoor dan outdoor AC Split standar.',
                'base_price' => 75000,
                'estimated_duration_hours' => 1.0,
                'warranty_days' => 14,
                'required_skill_level' => 'Dasar',
                'is_active' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'code' => 'SVC-AC-002',
                'name' => 'Isi Freon R32 (Per Psi)',
                'category' => 'Repair',
                'description' => 'Pengisian freon R32 untuk AC Split.',
                'base_price' => 150000,
                'estimated_duration_hours' => 1.0,
                'warranty_days' => 30,
                'required_skill_level' => 'Madya',
                'is_active' => true,
            ]
        ];

        foreach ($services as $svc) {
            JasaService::updateOrCreate(['tenant_id' => $tenantId, 'code' => $svc['code']], $svc);
        }

        // 2. Seed Jasa Technicians
        $technicians = [
            [
                'tenant_id' => $tenantId,
                'name' => 'Budi Santoso',
                'specialty' => 'Teknisi AC',
                'phone' => '081234567890',
                'email' => 'budi.teknisi@jasa.com',
                'rating' => 4.8,
                'completed_jobs' => 124,
                'current_status' => 'Tersedia',
                'is_active' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Agus Setiawan',
                'specialty' => 'Instalasi Pipa',
                'phone' => '089876543210',
                'email' => 'agus.teknisi@jasa.com',
                'rating' => 4.5,
                'completed_jobs' => 89,
                'current_status' => 'Bertugas',
                'is_active' => true,
            ]
        ];

        foreach ($technicians as $tech) {
            JasaTechnician::updateOrCreate(['tenant_id' => $tenantId, 'email' => $tech['email']], $tech);
        }

        // 3. Seed Contracts
        $contracts = [
            [
                'tenant_id' => $tenantId,
                'contract_number' => 'CTR-2026-0001',
                'title' => 'Maintenance AC Gedung A',
                'client_company' => 'PT. Maju Mundur',
                'client_name' => 'Bapak Dirman',
                'client_phone' => '021-5551234',
                'service_category' => 'Maintenance',
                'start_date' => date('Y-m-01'),
                'end_date' => date('Y-m-01', strtotime('+1 year')),
                'frequency' => 'Bulanan',
                'total_visits_quota' => 12,
                'completed_visits_count' => 0,
                'contract_value' => 5000000,
                'status' => 'Aktif',
            ]
        ];

        foreach ($contracts as $ctr) {
            JasaContract::updateOrCreate(['tenant_id' => $tenantId, 'contract_number' => $ctr['contract_number']], $ctr);
        }

        // 4. Seed Work Orders
        $spk1 = JasaWorkOrder::updateOrCreate(
            ['tenant_id' => $tenantId, 'spk_number' => 'SPK-' . date('Y') . '-0001'],
            [
                'title' => 'Service AC Mati Total',
                'customer_name' => 'Ibu Ratna',
                'customer_address' => 'Jl. Mawar No. 12',
                'category' => 'Repair',
                'equipment_name' => 'AC Daikin 1 PK',
                'priority' => 'Tinggi',
                'status' => 'Menunggu Konfirmasi',
                'scheduled_date' => date('Y-m-d'),
                'scheduled_time' => '10:00',
                'estimated_hours' => 2,
                'labor_rate' => 150000,
                'total_labor_cost' => 300000,
                'grand_total' => 300000,
                'payment_status' => 'Belum Bayar'
            ]
        );

        JasaWorkOrderLog::firstOrCreate([
            'work_order_id' => $spk1->id,
            'tenant_id' => $tenantId,
            'author' => 'System',
            'action' => 'Dibuat',
            'notes' => 'SPK Dibuat oleh Admin'
        ]);

        // 5. Seed Finance Transactions (Invoices & Expenses)
        $transactions = [
            [
                'tenant_id' => $tenantId,
                'type' => 'Pemasukan',
                'category' => 'Pendapatan SPK',
                'transaction_number' => 'INV-2026-0001',
                'notes' => 'Pembayaran SPK-2026-0001',
                'amount' => 300000,
                'payment_method' => 'Transfer Bank',
                'transaction_date' => now()->subDays(2),
            ],
            [
                'tenant_id' => $tenantId,
                'type' => 'Pengeluaran',
                'category' => 'Sparepart/Material',
                'transaction_number' => 'EXP-2026-0001',
                'notes' => 'Beli Sparepart AC',
                'amount' => 125000,
                'payment_method' => 'Kas / Tunai',
                'transaction_date' => now()->subDays(1),
            ],
            [
                'tenant_id' => $tenantId,
                'type' => 'Pemasukan',
                'category' => 'Tagihan Kontrak',
                'transaction_number' => 'INV-2026-0002',
                'notes' => 'Pembayaran DP Kontrak Gedung A',
                'amount' => 1500000,
                'payment_method' => 'Transfer Bank',
                'transaction_date' => now(),
            ],
        ];

        foreach ($transactions as $trx) {
            JasaFinanceTransaction::updateOrCreate(
                ['tenant_id' => $tenantId, 'transaction_number' => $trx['transaction_number']],
                $trx
            );
        }

        // 6. Seed Independent Jasa Inventory (Spareparts & Materials)
        $spareparts = [
            ['item_code' => 'SP-001', 'name' => 'Oli Mesin Standar 1L', 'category' => 'Oli & Pelumas', 'price' => 55000, 'stock' => 24, 'unit' => 'Botol'],
            ['item_code' => 'SP-002', 'name' => 'Kampas Rem Depan', 'category' => 'Suku Cadang', 'price' => 85000, 'stock' => 12, 'unit' => 'Set'],
            ['item_code' => 'SP-003', 'name' => 'Freon R32', 'category' => 'Material Khusus', 'price' => 35000, 'stock' => 50, 'unit' => 'Tabung'],
            ['item_code' => 'SP-004', 'name' => 'Pipa Tembaga AC (Permeter)', 'category' => 'Material Khusus', 'price' => 65000, 'stock' => 2, 'unit' => 'Meter'],
            ['item_code' => 'SP-005', 'name' => 'Sabun Cuci Khusus (1 Liter)', 'category' => 'Perlengkapan Cuci', 'price' => 20000, 'stock' => 15, 'unit' => 'Liter'],
        ];

        foreach ($spareparts as $sp) {
            JasaSparepart::updateOrCreate(
                ['tenant_id' => $tenantId, 'item_code' => $sp['item_code']],
                $sp
            );
        }
    }
}
