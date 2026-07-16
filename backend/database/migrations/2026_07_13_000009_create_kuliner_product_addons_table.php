<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_product_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('kuliner_products')->cascadeOnDelete();
            $table->foreignId('addon_id')->constrained('kuliner_addons')->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'addon_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_product_addons');
    }
};
