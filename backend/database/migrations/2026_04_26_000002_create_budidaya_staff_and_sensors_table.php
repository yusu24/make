<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budidaya_staff', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('budidaya_role_id')->nullable()->constrained('budidaya_roles')->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('position')->nullable();    // jabatan/posisi
            $table->enum('status', ['aktif', 'tidak_aktif'])->default('aktif');
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();
        });

        // Add a sensor/live data table for ponds (pH, temp, O2 etc.)
        Schema::create('budidaya_pond_sensors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pond_id')->constrained('budidaya_ponds')->cascadeOnDelete();
            $table->decimal('ph', 5, 2)->nullable();
            $table->decimal('temperature', 5, 2)->nullable();  // celsius
            $table->decimal('dissolved_oxygen', 5, 2)->nullable(); // mg/L
            $table->decimal('ammonia', 8, 4)->nullable();     // ppm
            $table->integer('population')->nullable();         // current fish count
            $table->integer('age_days')->nullable();           // days since cycle started
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budidaya_pond_sensors');
        Schema::dropIfExists('budidaya_staff');
    }
};
