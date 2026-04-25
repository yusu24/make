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
        Schema::create('budidaya_ponds', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name');
            $table->string('type')->default('tanah'); // tanah, beton, terpal
            $table->decimal('capacity_m3', 10, 2)->nullable();
            $table->string('status')->default('kosong'); // kosong, aktif, panen
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_ponds');
    }
};
