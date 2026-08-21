<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Katalog Layanan Jasa
        Schema::create('jasa_services', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id', 32)->index();
            $table->string('code', 50)->nullable();
            $table->string('name', 255);
            $table->string('category', 100);
            $table->text('description')->nullable();
            $table->decimal('base_price', 14, 2)->default(0);
            $table->decimal('estimated_duration_hours', 5, 2)->default(1);
            $table->integer('warranty_days')->default(0);
            $table->string('required_skill_level', 50)->default('Madya');
            $table->json('recommended_parts')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Data Teknisi & Personel Servis
        Schema::create('jasa_technicians', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id', 32)->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 150);
            $table->string('avatar')->nullable();
            $table->string('specialty', 150)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email', 150)->nullable();
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('completed_jobs')->default(0);
            $table->string('current_status', 50)->default('Tersedia'); // Tersedia, Bertugas, Izin / Cuti, Siaga
            $table->json('skills')->nullable();
            $table->json('certifications')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Surat Perintah Kerja (Work Orders / SPK)
        Schema::create('jasa_work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id', 32)->index();
            $table->string('spk_number', 50)->unique();
            $table->string('title', 255);
            $table->string('customer_name', 150);
            $table->string('customer_company', 150)->nullable();
            $table->string('customer_phone', 50)->nullable();
            $table->string('customer_email', 150)->nullable();
            $table->text('customer_address')->nullable();
            $table->string('category', 100);
            $table->string('equipment_name', 200);
            $table->string('serial_number', 100)->nullable();
            $table->string('priority', 30)->default('Sedang'); // Darurat, Tinggi, Sedang, Rendah
            $table->string('status', 50)->default('Menunggu Konfirmasi');
            $table->date('scheduled_date')->nullable();
            $table->string('scheduled_time', 20)->nullable();
            $table->date('completion_date')->nullable();
            $table->foreignId('assigned_technician_id')->nullable()->constrained('jasa_technicians')->nullOnDelete();
            $table->decimal('estimated_hours', 5, 2)->default(1);
            $table->decimal('actual_hours', 5, 2)->nullable();
            $table->decimal('labor_rate', 14, 2)->default(0);
            $table->text('service_description')->nullable();
            $table->text('root_cause_notes')->nullable();
            $table->decimal('total_parts_cost', 14, 2)->default(0);
            $table->decimal('total_labor_cost', 14, 2)->default(0);
            $table->decimal('grand_total', 14, 2)->default(0);
            $table->string('payment_status', 30)->default('Belum Bayar'); // Lunas, Sebagian (DP), Belum Bayar
            $table->string('warranty_period', 50)->default('30 Hari');
            $table->dateTime('sla_deadline')->nullable();
            $table->integer('customer_satisfaction')->nullable();
            $table->timestamps();
        });

        // 4. Penggunaan Sparepart / Material SPK
        Schema::create('jasa_order_parts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id', 32)->index();
            $table->foreignId('work_order_id')->constrained('jasa_work_orders')->cascadeOnDelete();
            $table->string('name', 255);
            $table->integer('quantity')->default(1);
            $table->decimal('unit_cost', 14, 2)->default(0);
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->timestamps();
        });

        // 5. Audit Log Aktivitas SPK
        Schema::create('jasa_work_order_logs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id', 32)->index();
            $table->foreignId('work_order_id')->constrained('jasa_work_orders')->cascadeOnDelete();
            $table->string('author', 100);
            $table->string('action', 100);
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jasa_work_order_logs');
        Schema::dropIfExists('jasa_order_parts');
        Schema::dropIfExists('jasa_work_orders');
        Schema::dropIfExists('jasa_technicians');
        Schema::dropIfExists('jasa_services');
    }
};
