<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BudidayaPond;
use App\Models\BudidayaCycle;
use App\Models\BudidayaInventory;
use App\Models\BudidayaFeeding;
use App\Models\BudidayaHealth;
use App\Models\BudidayaExpense;
use App\Models\BudidayaHarvest;
use Carbon\Carbon;

class SitiBudidayaSeeder extends Seeder
{
    const TENANT_ID = 'TN-0002';

    public function run(): void
    {
        $tenantId = self::TENANT_ID;

        $this->command->info('🐟 Seeding comprehensive Budidaya data for Siti Budidaya (TN-0002)...');

        // ── 1. Pastikan Inventory ada ──────────────────────────────────────────
        $pakanPelet = BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Pelet PF-1000'],
            ['category' => 'pakan', 'unit' => 'Kg', 'stock' => 350, 'price_per_unit' => 12000, 'min_stock' => 50]
        );
        $pakanSerbuk = BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Pelet Serbuk Starter'],
            ['category' => 'pakan', 'unit' => 'Kg', 'stock' => 80, 'price_per_unit' => 18000, 'min_stock' => 20]
        );
        $bibitNila = BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Bibit Nila Merah'],
            ['category' => 'bibit', 'unit' => 'Ekor', 'stock' => 2000, 'price_per_unit' => 200, 'min_stock' => 500]
        );
        $bibitLele = BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Bibit Lele Sangkuriang'],
            ['category' => 'bibit', 'unit' => 'Ekor', 'stock' => 3000, 'price_per_unit' => 150, 'min_stock' => 1000]
        );
        $bibitGuraMe = BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Bibit Gurame Soang'],
            ['category' => 'bibit', 'unit' => 'Ekor', 'stock' => 500, 'price_per_unit' => 500, 'min_stock' => 100]
        );
        BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Vitamin C Ikan'],
            ['category' => 'obat', 'unit' => 'Botol', 'stock' => 15, 'price_per_unit' => 50000, 'min_stock' => 5]
        );
        BudidayaInventory::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Garam Ikan / NaCl'],
            ['category' => 'obat', 'unit' => 'Kg', 'stock' => 30, 'price_per_unit' => 8000, 'min_stock' => 5]
        );

        $this->command->info('  ✅ Inventory seeded.');

        // ── 2. Pastikan kolam ada & update statusnya ───────────────────────────
        $pondA1 = BudidayaPond::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Kolam A1 - Nila'],
            ['type' => 'terpal', 'capacity_m3' => 15, 'status' => 'aktif']
        );
        $pondA2 = BudidayaPond::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Kolam A2 - Lele'],
            ['type' => 'terpal', 'capacity_m3' => 15, 'status' => 'aktif']
        );
        $pondB1 = BudidayaPond::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Kolam B1 - Beton'],
            ['type' => 'beton', 'capacity_m3' => 30, 'status' => 'kosong']
        );
        $pondC1 = BudidayaPond::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Kolam C1 - Tanah'],
            ['type' => 'tanah', 'capacity_m3' => 50, 'status' => 'aktif']
        );

        $this->command->info('  ✅ Ponds confirmed/updated.');

        // ─────────────────────────────────────────────────────────────────────
        // SIKLUS 1: Kolam A1 – Nila Merah (mulai akhir Maret, masih aktif)
        // ─────────────────────────────────────────────────────────────────────
        $startA1 = Carbon::create(2025, 3, 28); // Akhir Maret 2025
        $expectedA1 = Carbon::create(2025, 7, 15);

        // Hapus siklus lama jika ada yang conflict
        BudidayaCycle::where('tenant_id', $tenantId)
            ->where('pond_id', $pondA1->id)
            ->whereIn('status', ['aktif', 'pembibitan', 'pembesaran'])
            ->delete();

        $cycleA1 = BudidayaCycle::create([
            'tenant_id'            => $tenantId,
            'pond_id'              => $pondA1->id,
            'seed_type'            => 'Nila Merah Super',
            'seed_count'           => 1500,
            'seed_date'            => $startA1,
            'expected_harvest_date'=> $expectedA1,
            'status'               => 'pembesaran',
        ]);

        // Biaya benih
        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleA1->id,
            'category' => 'benih', 'amount' => 300000,
            'date' => $startA1, 'notes' => 'Tebar 1.500 ekor bibit Nila Merah Super'
        ]);

        // Biaya gaji
        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleA1->id,
            'category' => 'gaji', 'amount' => 800000,
            'date' => Carbon::create(2025, 4, 30), 'notes' => 'Gaji pekerja April'
        ]);
        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleA1->id,
            'category' => 'gaji', 'amount' => 800000,
            'date' => Carbon::create(2025, 5, 31), 'notes' => 'Gaji pekerja Mei'
        ]);

        // Biaya listrik
        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleA1->id,
            'category' => 'listrik', 'amount' => 250000,
            'date' => Carbon::create(2025, 4, 15), 'notes' => 'Listrik pompa aerasi April'
        ]);
        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleA1->id,
            'category' => 'listrik', 'amount' => 270000,
            'date' => Carbon::create(2025, 5, 15), 'notes' => 'Listrik pompa aerasi Mei'
        ]);

        // Feeding logs – 2x seminggu sejak April
        $feedingScheduleA1 = [
            // April
            ['2025-04-02', 2.0, 'Pakan pagi sore hari ke-5'],
            ['2025-04-07', 2.2, 'Pakan rutin pagi sore'],
            ['2025-04-11', 2.5, 'Pakan rutin pagi sore'],
            ['2025-04-15', 2.5, 'Pakan pagi sore + extra siang'],
            ['2025-04-19', 2.8, 'Pakan rutin'],
            ['2025-04-23', 2.8, 'Pakan rutin pagi sore'],
            ['2025-04-28', 3.0, 'Pakan rutin + sedikit lebih banyak'],
            // Mei
            ['2025-05-03', 3.0, 'Pakan rutin pagi sore'],
            ['2025-05-08', 3.2, 'Pakan rutin – ikan aktif'],
            ['2025-05-13', 3.5, 'Pakan pagi sore, ikan sudah besar'],
            ['2025-05-17', 3.5, 'Pakan rutin'],
            ['2025-05-22', 3.8, 'Pakan rutin – kondisi bagus'],
            ['2025-05-27', 4.0, 'Pakan intensif mendekati panen'],
            ['2025-05-31', 4.0, 'Pakan hari ini'],
        ];

        foreach ($feedingScheduleA1 as [$date, $kg, $note]) {
            BudidayaFeeding::updateOrCreate(
                ['cycle_id' => $cycleA1->id, 'date' => $date],
                ['inventory_id' => $pakanPelet->id, 'amount_kg' => $kg, 'notes' => $note]
            );
        }

        // Health logs
        BudidayaHealth::create([
            'cycle_id' => $cycleA1->id, 'date' => '2025-04-10',
            'mortality_count' => 25, 'disease_note' => 'Beberapa ikan lemas, insang merah',
            'treatment_note' => 'Penggantian air 30%, tambah aerasi, beri vitamin C'
        ]);
        BudidayaHealth::create([
            'cycle_id' => $cycleA1->id, 'date' => '2025-04-22',
            'mortality_count' => 8, 'disease_note' => 'Ikan berenang miring beberapa ekor',
            'treatment_note' => 'Pemberian garam ikan, kurangi kepadatan'
        ]);
        BudidayaHealth::create([
            'cycle_id' => $cycleA1->id, 'date' => '2025-05-15',
            'mortality_count' => 5, 'disease_note' => 'Kematian normal, kondisi umum baik',
            'treatment_note' => 'Tidak ada tindakan khusus, pantau terus'
        ]);

        $this->command->info('  ✅ Cycle A1 (Nila Merah, Kolam A1) seeded with full feeding & health logs.');

        // ─────────────────────────────────────────────────────────────────────
        // SIKLUS 2: Kolam A2 – Lele Sangkuriang (mulai awal April, masih aktif)
        // ─────────────────────────────────────────────────────────────────────
        $startA2 = Carbon::create(2025, 4, 5);
        $expectedA2 = Carbon::create(2025, 7, 10);

        BudidayaCycle::where('tenant_id', $tenantId)
            ->where('pond_id', $pondA2->id)
            ->whereIn('status', ['aktif', 'pembibitan', 'pembesaran'])
            ->delete();

        $cycleA2 = BudidayaCycle::create([
            'tenant_id'            => $tenantId,
            'pond_id'              => $pondA2->id,
            'seed_type'            => 'Lele Sangkuriang',
            'seed_count'           => 3000,
            'seed_date'            => $startA2,
            'expected_harvest_date'=> $expectedA2,
            'status'               => 'pembesaran',
        ]);

        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleA2->id,
            'category' => 'benih', 'amount' => 450000,
            'date' => $startA2, 'notes' => 'Tebar 3.000 ekor bibit Lele Sangkuriang'
        ]);
        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleA2->id,
            'category' => 'gaji', 'amount' => 750000,
            'date' => Carbon::create(2025, 4, 30), 'notes' => 'Gaji operator kolam lele April'
        ]);
        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleA2->id,
            'category' => 'gaji', 'amount' => 750000,
            'date' => Carbon::create(2025, 5, 31), 'notes' => 'Gaji operator kolam lele Mei'
        ]);

        $feedingScheduleA2 = [
            ['2025-04-07', 5.0, 'Pakan serbuk starter, hari ke-2'],
            ['2025-04-10', 5.5, 'Pakan serbuk, nafsu makan tinggi'],
            ['2025-04-14', 6.0, 'Beralih ke pelet PF-1000'],
            ['2025-04-18', 6.5, 'Pakan intensif pagi sore malam'],
            ['2025-04-22', 7.0, 'Pakan rutin 3x sehari'],
            ['2025-04-26', 7.5, 'Pakan rutin, pertumbuhan pesat'],
            ['2025-04-30', 8.0, 'Pakan akhir April'],
            ['2025-05-05', 8.0, 'Pakan rutin awal Mei'],
            ['2025-05-10', 8.5, 'Pakan intensif, lele agresif'],
            ['2025-05-15', 9.0, 'Pakan siang + malam extra'],
            ['2025-05-20', 9.0, 'Pakan rutin'],
            ['2025-05-25', 9.5, 'Pakan intensif mendekati panen'],
            ['2025-05-31', 10.0, 'Pakan hari ini – ukuran sudah besar'],
        ];

        foreach ($feedingScheduleA2 as [$date, $kg, $note]) {
            BudidayaFeeding::updateOrCreate(
                ['cycle_id' => $cycleA2->id, 'date' => $date],
                ['inventory_id' => $pakanPelet->id, 'amount_kg' => $kg, 'notes' => $note]
            );
        }

        BudidayaHealth::create([
            'cycle_id' => $cycleA2->id, 'date' => '2025-04-16',
            'mortality_count' => 40, 'disease_note' => 'Kematian biasa fase adaptasi awal',
            'treatment_note' => 'Normal, tidak perlu tindakan – pantau kualitas air'
        ]);
        BudidayaHealth::create([
            'cycle_id' => $cycleA2->id, 'date' => '2025-05-08',
            'mortality_count' => 15, 'disease_note' => 'Ikan saling kanibal ringan',
            'treatment_note' => 'Sortir ukuran, pindahkan lele besar ke sudut lain'
        ]);

        $this->command->info('  ✅ Cycle A2 (Lele Sangkuriang, Kolam A2) seeded.');

        // ─────────────────────────────────────────────────────────────────────
        // SIKLUS 3: Kolam C1 – Gurame (mulai akhir Maret, masih aktif, lebih baru)
        // ─────────────────────────────────────────────────────────────────────
        $startC1 = Carbon::create(2025, 3, 30);
        $expectedC1 = Carbon::create(2025, 12, 30); // Gurame butuh ~9 bulan

        BudidayaCycle::where('tenant_id', $tenantId)
            ->where('pond_id', $pondC1->id)
            ->whereIn('status', ['aktif', 'pembibitan', 'pembesaran'])
            ->delete();

        $cycleC1 = BudidayaCycle::create([
            'tenant_id'            => $tenantId,
            'pond_id'              => $pondC1->id,
            'seed_type'            => 'Gurame Soang',
            'seed_count'           => 600,
            'seed_date'            => $startC1,
            'expected_harvest_date'=> $expectedC1,
            'status'               => 'pembesaran',
        ]);

        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleC1->id,
            'category' => 'benih', 'amount' => 300000,
            'date' => $startC1, 'notes' => 'Tebar 600 ekor bibit Gurame Soang'
        ]);
        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleC1->id,
            'category' => 'gaji', 'amount' => 600000,
            'date' => Carbon::create(2025, 4, 30), 'notes' => 'Upah perawatan kolam tanah April'
        ]);
        BudidayaExpense::create([
            'tenant_id' => $tenantId, 'cycle_id' => $cycleC1->id,
            'category' => 'gaji', 'amount' => 600000,
            'date' => Carbon::create(2025, 5, 31), 'notes' => 'Upah perawatan kolam tanah Mei'
        ]);

        // Gurame makan lebih jarang
        $feedingScheduleC1 = [
            ['2025-04-03', 1.5, 'Pakan serbuk untuk gurame kecil'],
            ['2025-04-08', 1.5, 'Pakan rutin gurame'],
            ['2025-04-14', 1.8, 'Tambah daun pepaya – pakan alami'],
            ['2025-04-20', 2.0, 'Pakan pelet + daun'],
            ['2025-04-27', 2.0, 'Pakan rutin'],
            ['2025-05-04', 2.2, 'Pakan rutin pagi sore'],
            ['2025-05-12', 2.5, 'Pakan rutin – gurame tumbuh baik'],
            ['2025-05-20', 2.5, 'Pakan rutin'],
            ['2025-05-28', 2.8, 'Pakan rutin akhir Mei'],
        ];

        foreach ($feedingScheduleC1 as [$date, $kg, $note]) {
            BudidayaFeeding::updateOrCreate(
                ['cycle_id' => $cycleC1->id, 'date' => $date],
                ['inventory_id' => $pakanSerbuk->id, 'amount_kg' => $kg, 'notes' => $note]
            );
        }

        BudidayaHealth::create([
            'cycle_id' => $cycleC1->id, 'date' => '2025-04-20',
            'mortality_count' => 8, 'disease_note' => 'Kematian wajar fase adaptasi',
            'treatment_note' => 'Cek kualitas air, pH normal 7.0 - 7.5, tidak ada masalah serius'
        ]);

        $this->command->info('  ✅ Cycle C1 (Gurame Soang, Kolam C1) seeded.');

        // ─────────────────────────────────────────────────────────────────────
        // RIWAYAT: Kolam B1 – Siklus Selesai (panen bulan Maret)
        // ─────────────────────────────────────────────────────────────────────
        $startB1past = Carbon::create(2024, 9, 1);
        $harvestB1   = Carbon::create(2025, 3, 20);

        BudidayaCycle::where('tenant_id', $tenantId)
            ->where('pond_id', $pondB1->id)
            ->where('status', 'panen')
            ->delete();

        $cycleB1past = BudidayaCycle::create([
            'tenant_id'  => $tenantId,
            'pond_id'    => $pondB1->id,
            'seed_type'  => 'Nila GIFT',
            'seed_count' => 2000,
            'seed_date'  => $startB1past,
            'expected_harvest_date' => $harvestB1,
            'status'     => 'panen',
        ]);

        // Expenses
        BudidayaExpense::create(['tenant_id' => $tenantId, 'cycle_id' => $cycleB1past->id, 'category' => 'benih', 'amount' => 400000, 'date' => $startB1past, 'notes' => 'Tebar 2.000 ekor bibit Nila GIFT']);
        BudidayaExpense::create(['tenant_id' => $tenantId, 'cycle_id' => $cycleB1past->id, 'category' => 'pakan', 'amount' => 2400000, 'date' => '2024-10-01', 'notes' => 'Pembelian pakan batch 1']);
        BudidayaExpense::create(['tenant_id' => $tenantId, 'cycle_id' => $cycleB1past->id, 'category' => 'pakan', 'amount' => 1800000, 'date' => '2024-12-15', 'notes' => 'Pembelian pakan batch 2']);
        BudidayaExpense::create(['tenant_id' => $tenantId, 'cycle_id' => $cycleB1past->id, 'category' => 'gaji', 'amount' => 3500000, 'date' => '2025-03-01', 'notes' => 'Akumulasi gaji 6 bulan']);
        BudidayaExpense::create(['tenant_id' => $tenantId, 'cycle_id' => $cycleB1past->id, 'category' => 'panen', 'amount' => 500000, 'date' => $harvestB1, 'notes' => 'Biaya tenaga panen borongan']);

        // Feeding logs
        $feedingB1 = [
            ['2024-09-10', 4.0, 'Pakan awal adaptasi'],
            ['2024-09-20', 5.0, 'Pakan rutin pagi sore'],
            ['2024-10-05', 6.0, 'Pakan intensif pertumbuhan'],
            ['2024-10-20', 7.0, 'Pakan rutin'],
            ['2024-11-05', 8.0, 'Pakan rutin fase pembesaran'],
            ['2024-11-20', 8.5, 'Pakan rutin'],
            ['2024-12-05', 9.0, 'Pakan fattening dimulai'],
            ['2024-12-20', 9.5, 'Pakan fattening intensif'],
            ['2025-01-10', 10.0, 'Pakan fattening – bobot mendekati target'],
            ['2025-01-25', 10.0, 'Pakan rutin'],
            ['2025-02-10', 10.5, 'Pakan kurangi 20% pre-panen'],
            ['2025-03-01', 8.0, 'Puasa parsial pre-panen'],
        ];

        foreach ($feedingB1 as [$date, $kg, $note]) {
            BudidayaFeeding::create([
                'cycle_id'    => $cycleB1past->id,
                'inventory_id'=> $pakanPelet->id,
                'amount_kg'   => $kg,
                'date'        => $date,
                'notes'       => $note
            ]);
        }

        // Health logs
        BudidayaHealth::create(['cycle_id' => $cycleB1past->id, 'date' => '2024-10-15', 'mortality_count' => 30, 'disease_note' => 'Ikan lemas, insang pucat', 'treatment_note' => 'Ganti air 40%, tambah aerasi, vitamin C 3 hari berturut-turut']);
        BudidayaHealth::create(['cycle_id' => $cycleB1past->id, 'date' => '2024-12-10', 'mortality_count' => 15, 'disease_note' => 'Kematian normal musim hujan', 'treatment_note' => 'Tambah garam ikan, jaga kualitas air']);
        BudidayaHealth::create(['cycle_id' => $cycleB1past->id, 'date' => '2025-02-01', 'mortality_count' => 10, 'disease_note' => 'Kematian wajar menjelang panen', 'treatment_note' => 'Tidak ada tindakan khusus']);

        // Harvest record
        BudidayaHarvest::updateOrCreate(
            ['cycle_id' => $cycleB1past->id],
            [
                'harvest_date'      => $harvestB1,
                'total_weight_kg'   => 680,
                'sale_price_per_kg' => 28000,
                'total_revenue'     => 680 * 28000,
                'notes'             => 'Panen total 1.945 ekor, ukuran konsumsi 300-400gr/ekor, dijual ke pengepul pasar'
            ]
        );

        // Update status kolam B1 ke kosong
        $pondB1->update(['status' => 'kosong']);

        $this->command->info('  ✅ Past Cycle B1 (Nila GIFT – Selesai Panen) seeded.');

        $this->command->info('');
        $this->command->info('🎉 Siti Budidaya (TN-0002) comprehensive seeding DONE!');
        $this->command->info('   Kolam A1: Nila Merah (aktif sejak 28 Mar 2025)');
        $this->command->info('   Kolam A2: Lele Sangkuriang (aktif sejak 5 Apr 2025)');
        $this->command->info('   Kolam C1: Gurame Soang (aktif sejak 30 Mar 2025)');
        $this->command->info('   Kolam B1: Nila GIFT (panen 20 Mar 2025 - SELESAI)');
    }
}
