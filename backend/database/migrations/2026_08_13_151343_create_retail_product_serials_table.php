<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_product_serials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('outlet_id')->nullable();
            $table->string('serial_number');
            $table->string('status')->default('available'); // available, sold, returned, defective
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('retail_products')->onDelete('cascade');
            $table->foreign('outlet_id')->references('id')->on('retail_outlets')->onDelete('cascade');
            $table->unique(['product_id', 'serial_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_product_serials');
    }
};
