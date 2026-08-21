<?php
$dir = __DIR__ . '/../database/migrations/';
$migrations = [
    '2026_08_13_093500_create_financial_periods_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_periods', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('period_name')->comment('e.g., 2026-01');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('open')->comment('open, closed');
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
            
            $table->unique(['tenant_id', 'period_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_periods');
    }
};
EOT
];

foreach ($migrations as $file => $content) {
    file_put_contents($dir . $file, $content);
}

$modelsDir = __DIR__ . '/../app/Models/';
$models = [
    'FinancialPeriod' => <<<'EOT'
<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialPeriod extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'period_name', 'start_date', 'end_date', 'status', 
        'closed_by', 'closed_at'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'closed_at' => 'datetime',
    ];
}
EOT
];

foreach ($models as $name => $content) {
    file_put_contents($modelsDir . $name . '.php', $content);
}
echo "Done setting up migrations and models for Phase 3.\n";
