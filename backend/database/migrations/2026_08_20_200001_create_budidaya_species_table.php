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
        Schema::create('budidaya_species', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable()->index(); // null for system-wide defaults, string for tenant custom
            $table->string('category')->index(); // aquaculture, poultry, livestock, bird, other
            $table->string('name'); // Lele Dumbo, Nila Merah, Udang Vaname, Ayam Broiler, Sapi Limosin, Kambing Boer, Lovebird, etc.
            $table->string('scientific_name')->nullable();
            $table->string('code')->nullable();
            $table->string('default_unit')->default('ekor'); // ekor, bibit, pasang, kg
            $table->decimal('target_fcr', 5, 2)->nullable();
            $table->integer('harvest_days_target')->nullable();
            $table->integer('incubation_days')->nullable(); // masa pengeraman/mesin tetas
            $table->integer('gestation_days')->nullable(); // masa kebuntingan mamalia
            $table->json('recommended_parameters')->nullable(); // temperature, ph, feed rate guidelines
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_species');
    }
};
