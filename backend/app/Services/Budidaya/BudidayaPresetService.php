<?php

namespace App\Services\Budidaya;

class BudidayaPresetService
{
    /**
     * Get all available categories and profiles.
     */
    public static function getProfiles(): array
    {
        return [
            'aquaculture' => [
                'name' => 'Perikanan & Tambak (Aquaculture)',
                'profiles' => [
                    'bioflok_lele' => [
                        'name' => 'Ikan Lele (Sistem Bioflok)',
                        'tracking_mode' => 'group',
                        'unit_category' => 'pond',
                        'default_species' => 'Ikan Lele Dumbo / Mutiara',
                        'features' => [
                            'water_quality' => true,
                            'feed_management' => true,
                            'fcr_calculation' => true,
                            'group_tracking' => true,
                            'individual_tracking' => false,
                            'egg_production' => false,
                            'breeding_management' => false,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Kolam',
                            'unit_plural' => 'Daftar Kolam',
                            'cycle_name' => 'Siklus Pembesaran',
                            'seed_name' => 'Bibit / Benih Ikan',
                            'feed_name' => 'Pakan Pelet',
                            'sampling_name' => 'Sampling Bobot Ikan',
                            'output_name' => 'Panen Ikan (Kg)',
                        ]
                    ],
                    'tambak_udang' => [
                        'name' => 'Tambak Udang Vaname / Windu',
                        'tracking_mode' => 'group',
                        'unit_category' => 'pond',
                        'default_species' => 'Udang Vaname',
                        'features' => [
                            'water_quality' => true,
                            'feed_management' => true,
                            'fcr_calculation' => true,
                            'group_tracking' => true,
                            'individual_tracking' => false,
                            'egg_production' => false,
                            'breeding_management' => false,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Petak Tambak',
                            'unit_plural' => 'Daftar Tambak',
                            'cycle_name' => 'Siklus Tambak',
                            'seed_name' => 'Benur / Post Larvae',
                            'feed_name' => 'Pakan Udang',
                            'sampling_name' => 'Sampling Size / ABW',
                            'output_name' => 'Panen Parsial / Total (Kg)',
                        ]
                    ],
                    'nila_air_tawar' => [
                        'name' => 'Ikan Nila / Gurame / Patin / Mas',
                        'tracking_mode' => 'group',
                        'unit_category' => 'pond',
                        'default_species' => 'Ikan Nila Merah',
                        'features' => [
                            'water_quality' => true,
                            'feed_management' => true,
                            'fcr_calculation' => true,
                            'group_tracking' => true,
                            'individual_tracking' => false,
                            'egg_production' => false,
                            'breeding_management' => false,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Kolam Tanah/Beton',
                            'unit_plural' => 'Daftar Kolam',
                            'cycle_name' => 'Siklus Kolam',
                            'seed_name' => 'Bibit Ikan',
                            'feed_name' => 'Pakan Apung',
                            'sampling_name' => 'Sampling Ikan',
                            'output_name' => 'Panen Ikan (Kg)',
                        ]
                    ]
                ]
            ],
            'poultry' => [
                'name' => 'Peternakan Unggas (Poultry)',
                'profiles' => [
                    'ayam_broiler' => [
                        'name' => 'Ayam Broiler (Pedaging)',
                        'tracking_mode' => 'group',
                        'unit_category' => 'coop',
                        'default_species' => 'Ayam Broiler',
                        'features' => [
                            'water_quality' => false,
                            'feed_management' => true,
                            'fcr_calculation' => true,
                            'group_tracking' => true,
                            'individual_tracking' => false,
                            'egg_production' => false,
                            'breeding_management' => false,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Kandang',
                            'unit_plural' => 'Daftar Kandang',
                            'cycle_name' => 'Periode Chick-in',
                            'seed_name' => 'DOC (Day Old Chick)',
                            'feed_name' => 'Pakan Broiler / Konsentrat',
                            'sampling_name' => 'Sampling Bobot Mingguan',
                            'output_name' => 'Panen Ayam Hidup / Kg',
                        ]
                    ],
                    'ayam_petelur' => [
                        'name' => 'Ayam Petelur (Layer)',
                        'tracking_mode' => 'hybrid',
                        'unit_category' => 'battery_cage',
                        'default_species' => 'Ayam Layer Petelur',
                        'features' => [
                            'water_quality' => false,
                            'feed_management' => true,
                            'fcr_calculation' => true,
                            'group_tracking' => true,
                            'individual_tracking' => false,
                            'egg_production' => true,
                            'breeding_management' => false,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Kandang Baterai / Flok',
                            'unit_plural' => 'Daftar Kandang Baterai',
                            'cycle_name' => 'Siklus Produksi Layer',
                            'seed_name' => 'Pullet / Dara Masuk',
                            'feed_name' => 'Pakan Layer Konsentrat',
                            'sampling_name' => 'Cek Hen Day (%)',
                            'output_name' => 'Produksi Telur Harian (Butir/Kg)',
                        ]
                    ],
                    'puyuh_bebek' => [
                        'name' => 'Burung Puyuh / Bebek Petelur & Pedaging',
                        'tracking_mode' => 'group',
                        'unit_category' => 'cage',
                        'default_species' => 'Burung Puyuh Petelur',
                        'features' => [
                            'water_quality' => false,
                            'feed_management' => true,
                            'fcr_calculation' => true,
                            'group_tracking' => true,
                            'individual_tracking' => false,
                            'egg_production' => true,
                            'breeding_management' => false,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Kandang Rak / Sekat',
                            'unit_plural' => 'Daftar Kandang',
                            'cycle_name' => 'Siklus Populasi',
                            'seed_name' => 'DOQ / DOD Masuk',
                            'feed_name' => 'Pakan Campuran',
                            'sampling_name' => 'Sampling Populasi',
                            'output_name' => 'Panen Telur / Daging',
                        ]
                    ]
                ]
            ],
            'livestock' => [
                'name' => 'Peternakan Ruminansia & Mamalia (Livestock)',
                'profiles' => [
                    'kambing_domba' => [
                        'name' => 'Kambing & Domba (Breeding & Fattening)',
                        'tracking_mode' => 'hybrid',
                        'unit_category' => 'pen',
                        'default_species' => 'Kambing Boer / PE / Domba Garut',
                        'features' => [
                            'water_quality' => false,
                            'feed_management' => true,
                            'fcr_calculation' => false,
                            'group_tracking' => true,
                            'individual_tracking' => true,
                            'egg_production' => false,
                            'breeding_management' => true,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Kandang Panggung / Pen',
                            'unit_plural' => 'Daftar Kandang / Pen',
                            'cycle_name' => 'Batch Penggemukan / Breeding',
                            'seed_name' => 'Bakalan / Cempe Masuk',
                            'feed_name' => 'Hijauan / Konsentrat / Silase',
                            'sampling_name' => 'Penimbangan Bobot (ADG)',
                            'output_name' => 'Penjualan Ternak / Daging / Susu',
                        ]
                    ],
                    'sapi_potong_perah' => [
                        'name' => 'Sapi Potong & Sapi Perah',
                        'tracking_mode' => 'individual',
                        'unit_category' => 'pen',
                        'default_species' => 'Sapi Limosin / Simental / FH',
                        'features' => [
                            'water_quality' => false,
                            'feed_management' => true,
                            'fcr_calculation' => false,
                            'group_tracking' => false,
                            'individual_tracking' => true,
                            'egg_production' => false,
                            'breeding_management' => true,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Kandang / Paddock',
                            'unit_plural' => 'Daftar Paddock / Kandang',
                            'cycle_name' => 'Program Fattening / Laktasi',
                            'seed_name' => 'Pedet / Bakalan Sapi',
                            'feed_name' => 'Pakan Konsentrat & Rumput',
                            'sampling_name' => 'Timbang Bobot Sapi',
                            'output_name' => 'Penjualan Sapi / Panen Susu (Liter)',
                        ]
                    ]
                ]
            ],
            'bird' => [
                'name' => 'Budidaya Burung Kicau & Breeding (Bird Breeding)',
                'profiles' => [
                    'lovebird_breeding' => [
                        'name' => 'Lovebird (Breeding Warna & Suara)',
                        'tracking_mode' => 'individual',
                        'unit_category' => 'aviary',
                        'default_species' => 'Lovebird (Agapornis)',
                        'features' => [
                            'water_quality' => false,
                            'feed_management' => true,
                            'fcr_calculation' => false,
                            'group_tracking' => false,
                            'individual_tracking' => true,
                            'egg_production' => false,
                            'breeding_management' => true,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Kandang Ternak / Glodok',
                            'unit_plural' => 'Daftar Sangkar Ternak',
                            'cycle_name' => 'Periode Penjodohan',
                            'seed_name' => 'Indukan / Siapan Masuk',
                            'feed_name' => 'Milet & Extra Fooding (EF)',
                            'sampling_name' => 'Cek Kondisi & Bulu',
                            'output_name' => 'Penjualan Anakan / Ring',
                        ]
                    ],
                    'murai_kenari_kicau' => [
                        'name' => 'Murai Batu / Kenari / Kacer / Merpati',
                        'tracking_mode' => 'individual',
                        'unit_category' => 'cage',
                        'default_species' => 'Murai Batu Medan',
                        'features' => [
                            'water_quality' => false,
                            'feed_management' => true,
                            'fcr_calculation' => false,
                            'group_tracking' => false,
                            'individual_tracking' => true,
                            'egg_production' => false,
                            'breeding_management' => true,
                            'health_vaccination' => true,
                            'environmental_sensors' => false,
                        ],
                        'terminology' => [
                            'unit_name' => 'Sangkar Aviary / Kotak Jodoh',
                            'unit_plural' => 'Daftar Sangkar',
                            'cycle_name' => 'Musim Breeding',
                            'seed_name' => 'Indukan / Trotol Masuk',
                            'feed_name' => 'Voer, Kroto & Jangkrik',
                            'sampling_name' => 'Cek Performa & Suara',
                            'output_name' => 'Penjualan Anakan Ring Resmi',
                        ]
                    ]
                ]
            ]
        ];
    }

    /**
     * Resolve default configuration for a given category & profile key.
     */
    public static function resolveProfile(string $category, ?string $profileKey = null): array
    {
        $all = self::getProfiles();
        $catData = $all[$category] ?? $all['aquaculture'];
        
        if ($profileKey && isset($catData['profiles'][$profileKey])) {
            return $catData['profiles'][$profileKey];
        }

        // Return first profile as default
        return reset($catData['profiles']);
    }
}
