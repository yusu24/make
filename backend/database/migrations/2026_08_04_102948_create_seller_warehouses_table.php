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
        Schema::create('seller_warehouses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id'); // Foreign key to tenants
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('city')->nullable();
            $table->text('address')->nullable();
            $table->string('pic_name')->nullable();
            $table->string('pic_phone')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_warehouses');
    }
};
