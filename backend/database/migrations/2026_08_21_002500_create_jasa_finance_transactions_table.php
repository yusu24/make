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
        Schema::create('jasa_finance_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id', 32)->index();
            $table->string('transaction_number', 50);
            $table->string('type', 30); // Pemasukan, Pengeluaran
            $table->string('category', 100); // Pendapatan SPK, Tagihan Kontrak, Sparepart/Material, Gaji Teknisi, Operasional & Transport, Alat/Tools, Lain-lain
            $table->decimal('amount', 14, 2);
            $table->date('transaction_date');
            $table->string('payment_method', 50)->default('Transfer Bank'); // Transfer Bank, Kas / Tunai, QRIS / E-Wallet, Kartu Debit/Kredit
            $table->string('reference_number', 100)->nullable(); // SPK ID, Kontrak ID, No Kwitansi
            $table->string('recipient_or_payer', 150)->nullable(); // Klien / Vendor / Teknisi
            $table->text('notes')->nullable();
            $table->foreignId('work_order_id')->nullable()->constrained('jasa_work_orders')->nullOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained('jasa_contracts')->nullOnDelete();
            $table->timestamps();

            $table->unique(['tenant_id', 'transaction_number'], 'jasa_trx_tenant_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jasa_finance_transactions');
    }
};
