<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KulinerCategory;
use App\Models\Tenant;
use Illuminate\Support\Str;

class KulinerCategorySeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();
        if (!$tenant) return;

        $categories = [
            ['name' => 'Nasi & Lauk', 'desc' => 'Pilihan nasi rames dan lauk pauk khas nusantara.'],
            ['name' => 'Sup & Soto', 'desc' => 'Hidangan berkuah hangat dengan rempah melimpah.'],
            ['name' => 'Seafood', 'desc' => 'Hasil laut segar dimasak dengan bumbu autentik.'],
            ['name' => 'Minuman', 'desc' => 'Minuman tradisional penyegar dahaga.'],
            ['name' => 'Dessert', 'desc' => 'Pencuci mulut manis penggugah selera.'],
        ];

        foreach ($categories as $cat) {
            KulinerCategory::create([
                'tenant_id' => $tenant->tenant_id,
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']) . '-' . Str::random(5),
                'description' => $cat['desc'],
            ]);
        }
    }
}
