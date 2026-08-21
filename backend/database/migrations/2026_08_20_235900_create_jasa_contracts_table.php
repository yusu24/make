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
        Schema::create('jasa_contracts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id', 32)->index();
            $table->string('contract_number', 50);
            $table->string('title', 255);
            $table->string('client_company', 150);
            $table->string('client_name', 150);
            $table->string('client_phone', 50)->nullable();
            $table->string('client_email', 150)->nullable();
            $table->text('client_address')->nullable();
            $table->string('service_category', 100);
            $table->json('equipment_list')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('frequency', 50)->default('Bulanan'); // Bulanan, 2 Bulan Sekali, Kuartalan, 6 Bulan Sekali, Tahunan
            $table->integer('total_visits_quota')->default(12);
            $table->integer('completed_visits_count')->default(0);
            $table->date('next_schedule_date')->nullable();
            $table->decimal('contract_value', 14, 2)->default(0);
            $table->foreignId('assigned_technician_id')->nullable()->constrained('jasa_technicians')->nullOnDelete();
            $table->string('status', 30)->default('Aktif'); // Aktif, Segera Berakhir, Berakhir, Ditangguhkan
            $table->text('sla_notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'contract_number'], 'jasa_contracts_tenant_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jasa_contracts');
    }
};
