<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_payable_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payable_id')->constrained('retail_payables')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount_paid', 15, 2);
            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->useCurrent();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_payable_payments');
    }
};
