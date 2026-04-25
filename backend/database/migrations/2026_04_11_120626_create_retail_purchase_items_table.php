<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('retail_purchases')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('retail_products')->nullOnDelete();
            $table->decimal('qty', 10, 2);
            $table->decimal('cost_per_item', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_purchase_items');
    }
};
