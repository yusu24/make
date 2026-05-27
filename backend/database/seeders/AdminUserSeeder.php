<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insert or update the SaaS admin account
        User::updateOrCreate(
            ['email' => 'admin@umkm.com'],
            [
                'name' => 'SaaS Admin',
                'password' => Hash::make('password'),
                // Adjust fields according to your user schema
                // e.g., 'role' => 'admin', 'is_saas_admin' => true,
            ]
        );
    }
}
