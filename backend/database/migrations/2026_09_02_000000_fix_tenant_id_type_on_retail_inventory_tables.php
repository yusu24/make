<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = [
            'retail_outlets',
            'retail_product_stocks',
            'retail_product_batches',
            'retail_stock_transfers',
            'retail_product_serials',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    try {
                        $table->dropForeign(['tenant_id']);
                    } catch (\Throwable $e) {
                        // ignore if foreign key doesn't exist
                    }
                });

                Schema::table($tableName, function (Blueprint $table) {
                    $table->string('tenant_id')->change();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op for rollback safety
    }
};
