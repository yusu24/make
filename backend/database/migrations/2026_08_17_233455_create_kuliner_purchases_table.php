<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_purchases', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('reference_no')->unique();
            $table->foreignId('supplier_id')->nullable()->constrained('kuliner_suppliers')->nullOnDelete();
            $table->date('purchase_date');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('status', 30)->default('pending'); // pending, received, cancelled
            $table->string('payment_status', 30)->default('unpaid'); // unpaid, paid
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id', 'purchase_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_purchases');
    }
};
