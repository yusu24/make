<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_ingredient_opname_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opname_id')->constrained('kuliner_ingredient_opnames')->cascadeOnDelete();
            $table->foreignId('ingredient_id')->constrained('kuliner_ingredients')->cascadeOnDelete();
            $table->decimal('system_qty', 10, 2);
            $table->decimal('physical_qty', 10, 2);
            $table->decimal('difference', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_ingredient_opname_items');
    }
};
