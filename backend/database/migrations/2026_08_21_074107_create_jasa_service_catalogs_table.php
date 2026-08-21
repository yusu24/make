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
        Schema::create('jasa_service_catalogs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('code', 50);
            $table->string('name', 150);
            $table->string('category', 100);
            $table->text('description')->nullable();
            $table->decimal('base_price', 15, 2)->default(0);
            $table->decimal('estimated_duration_hours', 8, 2)->default(1);
            $table->integer('warranty_days')->default(0);
            $table->string('required_skill_level', 50)->default('Madya');
            $table->json('recommended_parts')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jasa_service_catalogs');
    }
};
