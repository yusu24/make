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
        Schema::create('budidaya_samplings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained('budidaya_cycles')->onDelete('cascade');
            $table->decimal('average_weight_gram', 10, 2);
            $table->decimal('estimated_biomass_kg', 10, 2)->nullable();
            $table->date('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_samplings');
    }
};
