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
        Schema::create('kuliner_orders', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('total_price', 15, 2);
            $table->string('status')->default('pending'); // pending, processing, completed, cancelled
            $table->string('payment_status')->default('unpaid'); // unpaid, paid
            $table->string('payment_method')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('customer_phone')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kuliner_orders');
    }
};
