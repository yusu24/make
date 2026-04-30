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
        Schema::create('budidaya_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->unsignedBigInteger('pond_id');
            $table->string('parameter'); // pH, temperature
            $table->decimal('value', 8, 2);
            $table->string('status'); // warning, critical
            $table->boolean('is_resolved')->default(false);
            $table->timestamps();

            $table->foreign('pond_id')->references('id')->on('budidaya_ponds')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_alerts');
    }
};
