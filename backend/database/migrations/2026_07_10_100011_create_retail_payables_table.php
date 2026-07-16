<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_payables', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('supplier_id')->constrained('retail_suppliers')->cascadeOnDelete();
            $table->foreignId('purchase_id')->nullable()->constrained('retail_purchases')->nullOnDelete();
            $table->decimal('total_amount', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('unpaid'); // unpaid | partial | paid
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_payables');
    }
};
