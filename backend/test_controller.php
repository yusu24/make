<?php
$user = App\Models\User::where('email', 'demo-sandbox-lJfacxg8@umkm-demo.com')->first();
$request = Illuminate\Http\Request::create('/api/jasa/settings', 'PUT', [
    'business_type' => 'Cleaning Service',
    'term_technician' => 'Cleaner',
    'term_sparepart' => 'Alat',
    'term_spk' => 'Order',
    'document_prefix' => 'CLN',
    'service_categories' => [],
    'technician_specialties' => [],
    'inventory_categories' => []
]);
$request->setUserResolver(function () use ($user) { return $user; });
$controller = new App\Http\Controllers\Api\JasaController();
$response = $controller->updateSettings($request);
echo $response->getContent();
