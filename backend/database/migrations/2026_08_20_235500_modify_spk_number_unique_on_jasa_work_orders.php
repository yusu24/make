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
        Schema::table('jasa_work_orders', function (Blueprint $table) {
            $table->dropUnique('jasa_work_orders_spk_number_unique');
            $table->unique(['tenant_id', 'spk_number'], 'jasa_work_orders_tenant_spk_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jasa_work_orders', function (Blueprint $table) {
            $table->dropUnique('jasa_work_orders_tenant_spk_unique');
            $table->unique('spk_number', 'jasa_work_orders_spk_number_unique');
        });
    }
};
