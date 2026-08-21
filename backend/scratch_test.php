<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = new \Illuminate\Http\Request();
$request->replace(['category' => 'toko-retail']);
$controller = app(\App\Http\Controllers\Api\AuthController::class);

try {
    $response = $controller->createDemoSandbox($request);
    echo "Response:\n";
    echo $response->getContent();
} catch (\Throwable $e) {
    echo "Error:\n";
    echo $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
