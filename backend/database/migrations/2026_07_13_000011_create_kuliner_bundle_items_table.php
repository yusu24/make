<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_bundle_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bundle_id')->constrained('kuliner_bundles')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('kuliner_products')->restrictOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->unique(['bundle_id', 'product_id']);
            $table->index('bundle_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_bundle_items');
    }
};
