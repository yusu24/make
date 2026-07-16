<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_customer_returns', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('transaction_id')->constrained('retail_transactions')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('retail_customers')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('return_number')->unique();
            $table->string('type', 20)->default('refund'); // refund | exchange
            $table->string('status', 20)->default('draft');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_customer_returns');
    }
};
