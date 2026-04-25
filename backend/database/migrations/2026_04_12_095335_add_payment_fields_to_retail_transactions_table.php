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
        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->decimal('paid_amount', 15, 2)->nullable()->after('total_amount');
            $table->decimal('change_amount', 15, 2)->nullable()->after('paid_amount');
            // Ensure payment_method is at least a string if not already
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->dropColumn(['paid_amount', 'change_amount']);
        });
    }
};
