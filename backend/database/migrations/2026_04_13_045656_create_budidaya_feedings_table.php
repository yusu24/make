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
        Schema::create('budidaya_feedings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained('budidaya_cycles')->onDelete('cascade');
            $table->foreignId('inventory_id')->constrained('budidaya_inventories')->onDelete('cascade');
            $table->decimal('amount_kg', 10, 2);
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_feedings');
    }
};
