<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_recipe_items', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('product_id')->constrained('kuliner_products')->cascadeOnDelete();
            $table->foreignId('ingredient_id')->constrained('kuliner_ingredients')->restrictOnDelete();
            $table->decimal('quantity', 10, 3);
            $table->string('note')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'ingredient_id']);
            $table->index(['tenant_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_recipe_items');
    }
};
