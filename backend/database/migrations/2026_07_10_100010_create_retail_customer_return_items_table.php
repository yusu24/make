<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_customer_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_id')->constrained('retail_customer_returns')->cascadeOnDelete();
            $table->foreignId('transaction_item_id')->constrained('retail_transaction_items')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('retail_products')->nullOnDelete();
            $table->string('product_name');
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->string('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_customer_return_items');
    }
};
