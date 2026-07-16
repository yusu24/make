<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_products', function (Blueprint $table) {
            $table->index('tenant_id');
        });

        Schema::table('retail_stock_opnames', function (Blueprint $table) {
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::table('retail_products', function (Blueprint $table) {
            $table->dropIndex(['tenant_id']);
        });

        Schema::table('retail_stock_opnames', function (Blueprint $table) {
            $table->dropIndex(['tenant_id']);
        });
    }
};
