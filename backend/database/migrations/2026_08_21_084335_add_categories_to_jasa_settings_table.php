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
        Schema::table('jasa_settings', function (Blueprint $table) {
            $table->json('service_categories')->nullable();
            $table->json('technician_specialties')->nullable();
            $table->json('inventory_categories')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jasa_settings', function (Blueprint $table) {
            $table->dropColumn(['service_categories', 'technician_specialties', 'inventory_categories']);
        });
    }
};
