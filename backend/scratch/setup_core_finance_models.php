<?php
$dir = __DIR__ . '/../database/migrations/';
$migrations = [
    '2026_08_13_092847_create_financial_accounts_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('code')->nullable();
            $table->string('name');
            $table->string('type')->default('cash')->comment('cash, bank, ewallet, qris, other');
            $table->string('currency', 10)->default('IDR');
            $table->decimal('opening_balance', 20, 2)->default(0);
            $table->date('opening_balance_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_accounts');
    }
};
EOT,
    '2026_08_13_092848_create_financial_categories_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_categories', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('code')->nullable();
            $table->string('name');
            $table->string('type')->comment('income, expense');
            $table->foreignId('parent_id')->nullable()->constrained('financial_categories')->nullOnDelete();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_categories');
    }
};
EOT,
    '2026_08_13_092848_create_financial_incomes_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_incomes', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('income_number')->unique();
            $table->date('date');
            $table->decimal('amount', 20, 2);
            $table->foreignId('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('financial_categories')->restrictOnDelete();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->text('description')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('source_module')->nullable();
            $table->string('source_type')->nullable();
            $table->string('source_id')->nullable();
            $table->string('status')->default('draft')->comment('draft, posted, cancelled');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_incomes');
    }
};
EOT,
    '2026_08_13_092849_create_financial_expenses_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_expenses', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('expense_number')->unique();
            $table->date('date');
            $table->decimal('amount', 20, 2);
            $table->foreignId('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('financial_categories')->restrictOnDelete();
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->text('description')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('source_module')->nullable();
            $table->string('source_type')->nullable();
            $table->string('source_id')->nullable();
            $table->string('status')->default('draft')->comment('draft, posted, cancelled');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_expenses');
    }
};
EOT,
    '2026_08_13_092850_create_financial_transactions_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('transaction_number')->unique();
            $table->string('type')->comment('income, expense, transfer, journal_entry');
            $table->date('date');
            $table->decimal('amount', 20, 2);
            $table->text('description')->nullable();
            $table->string('source_module')->nullable();
            $table->string('source_type')->nullable();
            $table->string('source_id')->nullable();
            $table->string('status')->default('posted')->comment('posted, reversed');
            $table->unsignedBigInteger('reverses_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'source_module', 'source_type', 'source_id'], 'idx_fin_trans_source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
EOT,
    '2026_08_13_092851_create_financial_transfers_table.php' => <<<'EOT'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('transfer_number')->unique();
            $table->date('date');
            $table->decimal('amount', 20, 2);
            $table->foreignId('from_account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignId('to_account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->text('description')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('status')->default('draft')->comment('draft, posted, cancelled');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transfers');
    }
};
EOT
];

foreach ($migrations as $file => $content) {
    file_put_contents($dir . $file, $content);
}

$modelsDir = __DIR__ . '/../app/Models/';
$models = [
    'FinancialAccount' => <<<'EOT'
<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialAccount extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'code', 'name', 'type', 'currency', 'opening_balance', 
        'opening_balance_date', 'is_active', 'description', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'opening_balance_date' => 'date',
        'is_active' => 'boolean',
    ];
}
EOT,
    'FinancialCategory' => <<<'EOT'
<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialCategory extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'code', 'name', 'type', 'parent_id', 'is_system', 'is_active'
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(FinancialCategory::class, 'parent_id');
    }
}
EOT,
    'FinancialIncome' => <<<'EOT'
<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialIncome extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'income_number', 'date', 'amount', 'account_id', 'category_id',
        'customer_id', 'description', 'reference_number', 'source_module', 
        'source_type', 'source_id', 'status', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function account()
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }

    public function category()
    {
        return $this->belongsTo(FinancialCategory::class, 'category_id');
    }
}
EOT,
    'FinancialExpense' => <<<'EOT'
<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialExpense extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'expense_number', 'date', 'amount', 'account_id', 'category_id',
        'supplier_id', 'description', 'reference_number', 'source_module', 
        'source_type', 'source_id', 'status', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function account()
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }

    public function category()
    {
        return $this->belongsTo(FinancialCategory::class, 'category_id');
    }
}
EOT,
    'FinancialTransaction' => <<<'EOT'
<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialTransaction extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'transaction_number', 'type', 'date', 'amount', 'description',
        'source_module', 'source_type', 'source_id', 'status', 'reverses_id', 'created_by'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];
}
EOT,
    'FinancialTransfer' => <<<'EOT'
<?php

namespace App\Models;

use App\Traits\HasTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialTransfer extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'tenant_id', 'transfer_number', 'date', 'amount', 'from_account_id', 
        'to_account_id', 'description', 'reference_number', 'status', 'created_by'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function fromAccount()
    {
        return $this->belongsTo(FinancialAccount::class, 'from_account_id');
    }

    public function toAccount()
    {
        return $this->belongsTo(FinancialAccount::class, 'to_account_id');
    }
}
EOT
];

foreach ($models as $name => $content) {
    file_put_contents($modelsDir . $name . '.php', $content);
}
echo "Done setting up migrations and models.\n";
