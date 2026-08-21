<?php

namespace Database\Seeders;

use App\Models\BudidayaSpecies;
use Illuminate\Database\Seeder;

class BudidayaSpeciesSeeder extends Seeder
{
    public function run(): void
    {
        $species = [
            // ── AQUACULTURE ──
            [
                'category' => 'aquaculture',
                'name' => 'Ikan Lele (Clarias gariepinus)',
                'scientific_name' => 'Clarias gariepinus',
                'code' => 'SPEC-AQ-LELE',
                'default_unit' => 'ekor',
                'target_fcr' => 1.05,
                'harvest_days_target' => 75,
                'recommended_parameters' => ['ph_min' => 6.5, 'ph_max' => 8.0, 'temp_min' => 26, 'temp_max' => 30],
            ],
            [
                'category' => 'aquaculture',
                'name' => 'Ikan Nila Merah (Oreochromis niloticus)',
                'scientific_name' => 'Oreochromis niloticus',
                'code' => 'SPEC-AQ-NILA',
                'default_unit' => 'ekor',
                'target_fcr' => 1.25,
                'harvest_days_target' => 120,
                'recommended_parameters' => ['ph_min' => 7.0, 'ph_max' => 8.5, 'temp_min' => 25, 'temp_max' => 30],
            ],
            [
                'category' => 'aquaculture',
                'name' => 'Udang Vaname (Litopenaeus vannamei)',
                'scientific_name' => 'Litopenaeus vannamei',
                'code' => 'SPEC-AQ-VANAME',
                'default_unit' => 'ekor',
                'target_fcr' => 1.20,
                'harvest_days_target' => 90,
                'recommended_parameters' => ['ph_min' => 7.5, 'ph_max' => 8.5, 'do_min' => 4.0, 'salinity_min' => 15],
            ],
            [
                'category' => 'aquaculture',
                'name' => 'Ikan Gurame (Osphronemus goramy)',
                'scientific_name' => 'Osphronemus goramy',
                'code' => 'SPEC-AQ-GURAME',
                'default_unit' => 'ekor',
                'target_fcr' => 1.50,
                'harvest_days_target' => 240,
                'recommended_parameters' => ['ph_min' => 6.5, 'ph_max' => 7.5, 'temp_min' => 25, 'temp_max' => 28],
            ],
            [
                'category' => 'aquaculture',
                'name' => 'Ikan Patin (Pangasius hypophthalmus)',
                'scientific_name' => 'Pangasius hypophthalmus',
                'code' => 'SPEC-AQ-PATIN',
                'default_unit' => 'ekor',
                'target_fcr' => 1.30,
                'harvest_days_target' => 180,
                'recommended_parameters' => ['ph_min' => 6.5, 'ph_max' => 8.0, 'temp_min' => 26, 'temp_max' => 30],
            ],

            // ── POULTRY ──
            [
                'category' => 'poultry',
                'name' => 'Ayam Broiler (Pedaging)',
                'scientific_name' => 'Gallus gallus domesticus (Broiler)',
                'code' => 'SPEC-PL-BROILER',
                'default_unit' => 'ekor',
                'target_fcr' => 1.55,
                'harvest_days_target' => 35,
                'recommended_parameters' => ['temp_min' => 24, 'temp_max' => 33],
            ],
            [
                'category' => 'poultry',
                'name' => 'Ayam Petelur (Layer Commercial)',
                'scientific_name' => 'Gallus gallus domesticus (Layer)',
                'code' => 'SPEC-PL-LAYER',
                'default_unit' => 'ekor',
                'target_fcr' => 2.10,
                'harvest_days_target' => 540,
                'incubation_days' => 21,
                'recommended_parameters' => ['lighting_hours' => 16, 'hen_day_target' => 90],
            ],
            [
                'category' => 'poultry',
                'name' => 'Bebek Pedaging / Petelur',
                'scientific_name' => 'Anas platyrhynchos',
                'code' => 'SPEC-PL-BEBEK',
                'default_unit' => 'ekor',
                'target_fcr' => 2.40,
                'harvest_days_target' => 60,
                'incubation_days' => 28,
            ],
            [
                'category' => 'poultry',
                'name' => 'Burung Puyuh (Coturnix coturnix)',
                'scientific_name' => 'Coturnix japonica',
                'code' => 'SPEC-PL-PUYUH',
                'default_unit' => 'ekor',
                'target_fcr' => 2.50,
                'harvest_days_target' => 45,
                'incubation_days' => 17,
            ],

            // ── LIVESTOCK ──
            [
                'category' => 'livestock',
                'name' => 'Sapi Potong (Limosin / Simental / PO)',
                'scientific_name' => 'Bos taurus / Bos indicus',
                'code' => 'SPEC-LS-SAPI-POTONG',
                'default_unit' => 'ekor',
                'harvest_days_target' => 120,
                'gestation_days' => 283,
            ],
            [
                'category' => 'livestock',
                'name' => 'Sapi Perah (Friesian Holstein)',
                'scientific_name' => 'Bos taurus (FH)',
                'code' => 'SPEC-LS-SAPI-PERAH',
                'default_unit' => 'ekor',
                'gestation_days' => 283,
            ],
            [
                'category' => 'livestock',
                'name' => 'Kambing Boer / PE (Peranakan Ettawa)',
                'scientific_name' => 'Capra aegagrus hircus',
                'code' => 'SPEC-LS-KAMBING',
                'default_unit' => 'ekor',
                'harvest_days_target' => 180,
                'gestation_days' => 150,
            ],
            [
                'category' => 'livestock',
                'name' => 'Domba Garut / Dorper / Texel',
                'scientific_name' => 'Ovis aries',
                'code' => 'SPEC-LS-DOMBA',
                'default_unit' => 'ekor',
                'harvest_days_target' => 150,
                'gestation_days' => 147,
            ],

            // ── BIRD BREEDING ──
            [
                'category' => 'bird',
                'name' => 'Lovebird (Agapornis)',
                'scientific_name' => 'Agapornis roseicollis / fischeri',
                'code' => 'SPEC-BD-LOVEBIRD',
                'default_unit' => 'ekor',
                'incubation_days' => 23,
                'recommended_parameters' => ['clutch_size_avg' => 4, 'weaning_days' => 45],
            ],
            [
                'category' => 'bird',
                'name' => 'Murai Batu (Copsychus malabaricus)',
                'scientific_name' => 'Copsychus malabaricus',
                'code' => 'SPEC-BD-MURAI',
                'default_unit' => 'ekor',
                'incubation_days' => 14,
                'recommended_parameters' => ['clutch_size_avg' => 3, 'weaning_days' => 30],
            ],
            [
                'category' => 'bird',
                'name' => 'Burung Kenari (Serinus canaria)',
                'scientific_name' => 'Serinus canaria domestica',
                'code' => 'SPEC-BD-KENARI',
                'default_unit' => 'ekor',
                'incubation_days' => 14,
                'recommended_parameters' => ['clutch_size_avg' => 4, 'weaning_days' => 28],
            ],
            [
                'category' => 'bird',
                'name' => 'Merpati Balap & Hias (Columba livia)',
                'scientific_name' => 'Columba livia domestica',
                'code' => 'SPEC-BD-MERPATI',
                'default_unit' => 'ekor',
                'incubation_days' => 18,
                'recommended_parameters' => ['clutch_size_avg' => 2, 'weaning_days' => 30],
            ]
        ];

        foreach ($species as $sp) {
            BudidayaSpecies::updateOrCreate(
                ['code' => $sp['code']],
                $sp
            );
        }
    }
}
