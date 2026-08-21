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
        Schema::create('jasa_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('business_type', 100)->default('Bengkel / Servis');
            $table->string('term_technician', 50)->default('Teknisi');
            $table->string('term_sparepart', 50)->default('Sparepart');
            $table->string('term_spk', 50)->default('SPK');
            $table->string('document_prefix', 10)->default('SRV');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jasa_settings');
    }
};
