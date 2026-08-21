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
            $table->decimal('price_shopee', 15, 2)->nullable()->after('price_sell');
            $table->decimal('price_tokopedia', 15, 2)->nullable()->after('price_shopee');
            $table->decimal('price_tiktok', 15, 2)->nullable()->after('price_tokopedia');
            $table->decimal('price_lazada', 15, 2)->nullable()->after('price_tiktok');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retail_products', function (Blueprint $table) {
            $table->dropColumn(['price_shopee', 'price_tokopedia', 'price_tiktok', 'price_lazada']);
        });
    }
};
