<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('from_outlet_id');
            $table->unsignedBigInteger('to_outlet_id');
            $table->string('reference_no')->unique();
            $table->string('status')->default('pending'); // pending, completed, cancelled
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('from_outlet_id')->references('id')->on('retail_outlets')->onDelete('cascade');
            $table->foreign('to_outlet_id')->references('id')->on('retail_outlets')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_stock_transfers');
    }
};
