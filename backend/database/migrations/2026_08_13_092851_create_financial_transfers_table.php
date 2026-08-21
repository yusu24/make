<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('transfer_number')->unique();
            $table->date('date');
            $table->decimal('amount', 20, 2);
            $table->foreignId('from_account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignId('to_account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->text('description')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('status')->default('draft')->comment('draft, posted, cancelled');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transfers');
    }
};