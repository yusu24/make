<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('transaction_number')->unique();
            $table->string('type')->comment('income, expense, transfer, journal_entry');
            $table->date('date');
            $table->decimal('amount', 20, 2);
            $table->text('description')->nullable();
            $table->string('source_module', 50)->nullable();
            $table->string('source_type', 50)->nullable();
            $table->string('source_id', 50)->nullable();
            $table->string('status')->default('posted')->comment('posted, reversed');
            $table->unsignedBigInteger('reverses_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'source_module', 'source_type', 'source_id'], 'idx_fin_trans_source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};