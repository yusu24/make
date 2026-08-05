<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('seller_warehouses', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });

        DB::statement('ALTER TABLE seller_warehouses MODIFY tenant_id VARCHAR(255) NOT NULL');

        Schema::table('seller_warehouses', function (Blueprint $table) {
            $table->index('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_warehouses', function (Blueprint $table) {
            $table->dropIndex(['seller_warehouses_tenant_id_index']);
        });

        DB::statement('ALTER TABLE seller_warehouses MODIFY tenant_id BIGINT UNSIGNED NOT NULL');

        Schema::table('seller_warehouses', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }
};
