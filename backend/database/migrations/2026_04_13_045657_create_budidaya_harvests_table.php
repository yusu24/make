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
        Schema::create('budidaya_harvests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained('budidaya_cycles')->onDelete('cascade');
            $table->decimal('total_weight_kg', 10, 2);
            $table->decimal('sale_price_per_kg', 15, 2)->nullable();
            $table->decimal('total_revenue', 15, 2)->nullable();
            $table->date('harvest_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_harvests');
    }
};
