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
        Schema::table('retail_transaction_items', function (Blueprint $table) {
            $table->string('unit')->nullable()->after('product_id');
            $table->decimal('conversion', 8, 2)->default(1)->after('unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retail_transaction_items', function (Blueprint $table) {
            $table->dropColumn(['unit', 'conversion']);
        });
    }
};
