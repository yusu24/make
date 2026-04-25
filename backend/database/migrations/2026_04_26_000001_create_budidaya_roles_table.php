<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budidaya_roles', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name');          // Admin, Manajer Tambak, Pekerja Lapangan
            $table->string('slug')->nullable(); // admin, manajer_tambak, pekerja
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false); // system roles can't be deleted
            $table->json('permissions')->nullable();      // JSON object of permission keys
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budidaya_roles');
    }
};
