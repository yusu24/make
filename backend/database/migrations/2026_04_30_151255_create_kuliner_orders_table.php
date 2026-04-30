<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_orders', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('customer_address')->nullable();
            $table->string('payment_method')->default('cod');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('service_fee', 15, 2)->default(0);
            $table->string('status')->default('pending'); // pending, confirmed, processing, completed, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('kuliner_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('kuliner_orders')->onDelete('cascade');
            $table->string('product_id')->nullable(); // could be string from frontend
            $table->string('product_name');
            $table->integer('quantity');
            $table->decimal('price', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_order_items');
        Schema::dropIfExists('kuliner_orders');
    }
};
