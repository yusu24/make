<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\User::find(4);
echo "USER 4: " . ($user ? json_encode($user->toArray()) : 'NOT FOUND') . PHP_EOL;

$allUsers = \App\Models\User::all();
echo "ALL USERS: " . json_encode($allUsers->toArray()) . PHP_EOL;
