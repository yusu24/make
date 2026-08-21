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
        Schema::create('budidaya_settings', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->unique();
            $table->enum('farm_type', ['ikan', 'unggas', 'ruminansia'])->default('ikan');
            $table->string('farm_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_settings');
    }
};
