<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_product_modifier_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('kuliner_products')->cascadeOnDelete();
            $table->foreignId('modifier_group_id')->constrained('kuliner_modifier_groups')->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'modifier_group_id'], 'kpmg_product_modifier_group_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_product_modifier_groups');
    }
};
