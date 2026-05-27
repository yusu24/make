<?php
/**
 * Reset the application database while preserving the SaaS admin user.
 *
 * Usage: php reset_database.php
 */
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Admin credentials (adjust if needed)
$adminEmail = 'admin@umkm.com';
$adminPassword = 'password'; // plain text, will be hashed

// Retrieve existing admin data if present
$existingAdmin = DB::table('users')->where('email', $adminEmail)->first();
$adminData = $existingAdmin ? (array) $existingAdmin : null;

// Fresh migration (drops all tables and recreates them, runs seeders)
$kernel->call('migrate:fresh', ['--seed' => true]);

// Ensure only the admin user exists (remove other users)
DB::table('users')->where('email', '!=', $adminEmail)->delete();

// Upsert admin user (update if exists, insert otherwise)
DB::table('users')->updateOrInsert(
    ['email' => $adminEmail],
    [
        'name' => $adminData['name'] ?? 'Admin',
        'password' => Hash::make($adminPassword),
        'role' => $adminData['role'] ?? 'admin',
        'tenant_id' => $adminData['tenant_id'] ?? null,
        'created_at' => now(),
        'updated_at' => now(),
    ]
);

echo "Database reset complete. Admin user preserved.\n";
?>
