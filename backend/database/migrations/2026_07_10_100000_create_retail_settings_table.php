<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_settings', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->unique();
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->string('receipt_footer')->nullable();
            $table->string('qris_image_path')->nullable();
            $table->integer('points_ratio')->default(10000);
            $table->decimal('low_stock_default_threshold', 10, 2)->default(5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_settings');
    }
};
