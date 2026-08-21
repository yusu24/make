<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_product_batches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('outlet_id');
            $table->string('batch_no');
            $table->date('expired_date')->nullable();
            $table->decimal('stock', 15, 2)->default(0);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('retail_products')->onDelete('cascade');
            $table->foreign('outlet_id')->references('id')->on('retail_outlets')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_product_batches');
    }
};
