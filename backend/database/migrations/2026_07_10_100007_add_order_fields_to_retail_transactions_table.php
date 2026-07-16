<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->decimal('discount_amount', 15, 2)->default(0)->after('total_amount');
            $table->decimal('tax_amount', 15, 2)->default(0)->after('discount_amount');
            $table->string('status', 20)->default('paid')->after('payment_method');
            $table->timestamp('voided_at')->nullable()->after('status');
            $table->foreignId('voided_by')->nullable()->after('voided_at')->constrained('users')->nullOnDelete();
            $table->string('void_reason')->nullable()->after('voided_by');
            $table->foreignId('discount_id')->nullable()->after('void_reason')->constrained('retail_discounts')->nullOnDelete();
            $table->foreignId('pricelist_id')->nullable()->after('discount_id')->constrained('retail_pricelists')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->dropForeign(['voided_by']);
            $table->dropForeign(['discount_id']);
            $table->dropForeign(['pricelist_id']);
            $table->dropColumn([
                'discount_amount', 'tax_amount', 'status', 'voided_at',
                'voided_by', 'void_reason', 'discount_id', 'pricelist_id',
            ]);
        });
    }
};
