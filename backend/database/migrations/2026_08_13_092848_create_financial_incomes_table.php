<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_incomes', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('income_number')->unique();
            $table->date('date');
            $table->decimal('amount', 20, 2);
            $table->foreignId('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('financial_categories')->restrictOnDelete();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->text('description')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('source_module')->nullable();
            $table->string('source_type')->nullable();
            $table->string('source_id')->nullable();
            $table->string('status')->default('draft')->comment('draft, posted, cancelled');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_incomes');
    }
};