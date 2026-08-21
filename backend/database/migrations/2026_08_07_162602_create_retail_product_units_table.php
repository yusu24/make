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
        Schema::create('retail_product_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('retail_products')->cascadeOnDelete();
            $table->string('unit');
            $table->decimal('conversion', 10, 2)->default(1);
            $table->string('barcode')->nullable();
            $table->decimal('price_sell', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retail_product_units');
    }
};
