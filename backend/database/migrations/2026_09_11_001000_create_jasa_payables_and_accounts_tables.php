<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('jasa_payables')) {
            Schema::create('jasa_payables', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id', 32)->index();
                $table->string('supplier_name', 150);
                $table->string('invoice_number', 100);
                $table->date('issue_date');
                $table->date('due_date');
                $table->decimal('total_amount', 14, 2);
                $table->decimal('paid_amount', 14, 2)->default(0);
                $table->string('status', 50)->default('Belum Dibayar');
                $table->string('category', 100)->default('Belanja Suku Cadang');
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index(['tenant_id', 'status']);
            });
        }

        if (!Schema::hasTable('jasa_accounts')) {
            Schema::create('jasa_accounts', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id', 32)->index();
                $table->string('name', 150);
                $table->string('type', 50)->default('Kas Tunai');
                $table->string('account_number', 100)->nullable();
                $table->decimal('balance', 14, 2)->default(0);
                $table->string('color', 50)->default('emerald');
                $table->timestamps();

                $table->index(['tenant_id', 'type']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('jasa_accounts');
        Schema::dropIfExists('jasa_payables');
    }
};