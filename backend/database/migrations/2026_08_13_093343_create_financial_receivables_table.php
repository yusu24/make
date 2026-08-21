<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_receivables', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('invoice_number')->unique();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->date('due_date');
            $table->decimal('total_amount', 20, 2);
            $table->decimal('paid_amount', 20, 2)->default(0);
            $table->decimal('remaining_amount', 20, 2)->virtualAs('total_amount - paid_amount');
            $table->string('status')->default('unpaid')->comment('unpaid, partial, paid, overdue, cancelled');
            $table->text('description')->nullable();
            $table->string('source_module')->nullable();
            $table->string('source_type')->nullable();
            $table->string('source_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_receivables');
    }
};