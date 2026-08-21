<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_transaction_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaction_id');
            $table->string('payment_method'); // CASH, QRIS, TRANSFER, CARD
            $table->decimal('amount', 15, 2)->default(0);
            $table->timestamps();

            $table->foreign('transaction_id')->references('id')->on('retail_transactions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_transaction_payments');
    }
};
