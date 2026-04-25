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
        Schema::table('retail_products', function (Blueprint $table) {
            $table->decimal('stock', 10, 2)->default(0)->change();
        });
        Schema::table('retail_transaction_items', function (Blueprint $table) {
            $table->decimal('qty', 10, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retail_products', function (Blueprint $table) {
            $table->integer('stock')->default(0)->change();
        });
        Schema::table('retail_transaction_items', function (Blueprint $table) {
            $table->integer('qty')->change();
        });
    }
};
