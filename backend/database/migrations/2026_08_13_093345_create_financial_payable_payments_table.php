<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_payable_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payable_id')->constrained('financial_payables')->cascadeOnDelete();
            $table->date('payment_date');
            $table->decimal('amount', 20, 2);
            $table->foreignId('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_payable_payments');
    }
};