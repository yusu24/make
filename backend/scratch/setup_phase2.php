<?php
$dir = __DIR__ . '/../database/migrations/';
$migrations = [
    '2026_08_13_093343_create_financial_receivables_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_receivables', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('invoice_number')->unique();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->date('due_date');
            $table->decimal('total_amount', 20, 2);
            $table->decimal('paid_amount', 20, 2)->default(0);
            $table->decimal('remaining_amount', 20, 2)->virtualAs('total_amount - paid_amount');
            $table->string('status')->default('unpaid')->comment('unpaid, partial, paid, overdue, cancelled');
            $table->text('description')->nullable();
            $table->string('source_module')->nullable();
            $table->string('source_type')->nullable();
            $table->string('source_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_receivables');
    }
};
EOT,
    '2026_08_13_093344_create_financial_receivable_payments_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_receivable_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receivable_id')->constrained('financial_receivables')->cascadeOnDelete();
            $table->date('payment_date');
            $table->decimal('amount', 20, 2);
            $table->foreignId('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_receivable_payments');
    }
};
EOT,
    '2026_08_13_093344_create_financial_payables_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_payables', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('invoice_number')->unique();
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->date('due_date');
            $table->decimal('total_amount', 20, 2);
            $table->decimal('paid_amount', 20, 2)->default(0);
            $table->decimal('remaining_amount', 20, 2)->virtualAs('total_amount - paid_amount');
            $table->string('status')->default('unpaid')->comment('unpaid, partial, paid, overdue, cancelled');
            $table->text('description')->nullable();
            $table->string('source_module')->nullable();
            $table->string('source_type')->nullable();
            $table->string('source_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_payables');
    }
};
EOT,
    '2026_08_13_093345_create_financial_payable_payments_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_payable_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payable_id')->constrained('financial_payables')->cascadeOnDelete();
            $table->date('payment_date');
            $table->decimal('amount', 20, 2);
            $table->foreignId('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_payable_payments');
    }
};
EOT
];

foreach ($migrations as $file => $content) {
    file_put_contents($dir . $file, $content);
}

$modelsDir = __DIR__ . '/../app/Models/';
$models = [
    'FinancialReceivable' => <<<'EOT'
<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialReceivable extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'invoice_number', 'customer_id', 'due_date', 'total_amount', 
        'paid_amount', 'status', 'description', 'source_module', 'source_type', 
        'source_id', 'created_by'
    ];

    protected $casts = [
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    public function payments()
    {
        return $this->hasMany(FinancialReceivablePayment::class, 'receivable_id');
    }
}
EOT,
    'FinancialReceivablePayment' => <<<'EOT'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialReceivablePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'receivable_id', 'payment_date', 'amount', 'account_id', 'reference_number', 
        'notes', 'created_by'
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function receivable()
    {
        return $this->belongsTo(FinancialReceivable::class, 'receivable_id');
    }

    public function account()
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }
}
EOT,
    'FinancialPayable' => <<<'EOT'
<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialPayable extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'invoice_number', 'supplier_id', 'due_date', 'total_amount', 
        'paid_amount', 'status', 'description', 'source_module', 'source_type', 
        'source_id', 'created_by'
    ];

    protected $casts = [
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    public function payments()
    {
        return $this->hasMany(FinancialPayablePayment::class, 'payable_id');
    }
}
EOT,
    'FinancialPayablePayment' => <<<'EOT'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialPayablePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payable_id', 'payment_date', 'amount', 'account_id', 'reference_number', 
        'notes', 'created_by'
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function payable()
    {
        return $this->belongsTo(FinancialPayable::class, 'payable_id');
    }

    public function account()
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }
}
EOT
];

foreach ($models as $name => $content) {
    file_put_contents($modelsDir . $name . '.php', $content);
}
echo "Done setting up migrations and models for Phase 2.\n";
