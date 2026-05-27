<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\KulinerController;
use Illuminate\Http\Request;

// Mock the user and tenant
$user = App\Models\User::first();
auth()->login($user);

$request = Request::create('/api/kuliner/admin/staff', 'POST', [
    'name' => 'New Staff',
    'email' => 'fixed_email@test.com', // Fixed email
    'password' => 'password123',
    'role' => 'cashier',
    'phone' => '123456789'
]);

$controller = app(KulinerController::class);

try {
    $response = $controller->storeStaff($request);
    echo "Status Code: " . $response->getStatusCode() . "\n";
    echo "Response Content: " . $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
