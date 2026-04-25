<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('invoice_no');
            $table->decimal('total_amount', 15, 2);
            $table->string('payment_method')->default('CASH');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_transactions');
    }
};
