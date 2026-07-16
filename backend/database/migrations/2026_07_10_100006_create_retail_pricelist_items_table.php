<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_pricelist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pricelist_id')->constrained('retail_pricelists')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('retail_products')->cascadeOnDelete();
            $table->decimal('price', 15, 2);
            $table->decimal('min_qty', 10, 2)->default(1);
            $table->timestamps();

            $table->unique(['pricelist_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_pricelist_items');
    }
};
