<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_periods', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('period_name')->comment('e.g., 2026-01');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('open')->comment('open, closed');
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
            
            $table->unique(['tenant_id', 'period_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_periods');
    }
};