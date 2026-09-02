<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('budidaya_incomes')) {
            Schema::create('budidaya_incomes', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id', 32)->index();
                $table->foreignId('cycle_id')->nullable()->constrained('budidaya_cycles')->onDelete('set null');
                $table->string('category', 100)->default('Penjualan Panen');
                $table->decimal('amount', 15, 2);
                $table->date('date');
                $table->string('payment_method', 50)->nullable()->default('Tunai / Kas');
                $table->string('recipient_or_buyer', 150)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_incomes');
    }
};
