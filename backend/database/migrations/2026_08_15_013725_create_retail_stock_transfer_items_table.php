<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_stock_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transfer_id');
            $table->unsignedBigInteger('product_id');
            $table->decimal('quantity', 15, 2);
            $table->string('unit')->nullable();
            $table->timestamps();

            $table->foreign('transfer_id')->references('id')->on('retail_stock_transfers')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('retail_products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_stock_transfer_items');
    }
};
