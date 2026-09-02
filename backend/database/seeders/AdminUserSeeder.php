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
        $devEmail = env('DEV_EMAIL', 'needleproject240696@gmail.com');
        $devPassword = env('DEV_PASSWORD', 'Aku240696@');

        // Insert or update the SaaS super admin developer account
        User::updateOrCreate(
            ['email' => $devEmail],
            [
                'name' => 'Super Admin (Developer)',
                'password' => Hash::make($devPassword),
                'role' => 'super_admin',
                'status' => 'active',
            ]
        );
    }
}
