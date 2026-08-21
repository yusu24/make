<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_hold_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('user_id'); // cashier
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('reference_name');
            $table->json('cart_data');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('retail_customers')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_hold_transactions');
    }
};
