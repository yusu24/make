<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $user = App\Models\User::create([
        'tenant_id' => '1', 
        'name' => 'test_user', 
        'email' => 'test_user_' . time() . '@test.com', 
        'password' => Illuminate\Support\Facades\Hash::make('password'), 
        'role' => 'staff'
    ]);
    echo "Success! ID: " . $user->id;
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
