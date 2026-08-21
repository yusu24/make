<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$models = glob(__DIR__ . '/app/Models/Retail*.php');
$errors = [];

foreach ($models as $file) {
    $className = 'App\\Models\\' . basename($file, '.php');
    if (!class_exists($className)) continue;
    
    $model = new $className;
    $reflector = new ReflectionClass($className);
    
    foreach ($reflector->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
        if ($method->class !== $className) continue;
        if ($method->getNumberOfParameters() > 0) continue;
        if ($method->getName() === 'isPaid' || $method->getName() === 'isVoided') continue;

        try {
            $relation = $model->{$method->getName()}();
            if ($relation instanceof \Illuminate\Database\Eloquent\Relations\Relation) {
                // It's a valid relation
                // echo $className . " -> " . $method->getName() . " is OK\n";
            }
        } catch (\Throwable $e) {
            $errors[] = "$className -> {$method->getName()}: " . $e->getMessage();
        }
    }
}

if (empty($errors)) {
    echo "All Retail Eloquent relationships are correctly defined.\n";
} else {
    echo "Found errors in relationships:\n";
    foreach ($errors as $err) {
        echo "- $err\n";
    }
}
