<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_stock_opname_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opname_id')->constrained('retail_stock_opnames')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('retail_products')->cascadeOnDelete();
            $table->decimal('system_qty', 10, 2);
            $table->decimal('physical_qty', 10, 2);
            $table->decimal('difference', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_stock_opname_items');
    }
};
