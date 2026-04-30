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
        Schema::create('kuliner_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('kuliner_orders')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('kuliner_products');
            $table->integer('quantity');
            $table->decimal('price', 15, 2); // price at the time of order
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kuliner_order_items');
    }
};
