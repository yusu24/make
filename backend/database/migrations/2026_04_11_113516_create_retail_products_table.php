<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_products', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('supplier_id')->nullable()->constrained('retail_suppliers')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('retail_categories')->nullOnDelete();
            $table->string('sku');
            $table->string('name');
            $table->integer('stock')->default(0);
            $table->decimal('price_buy', 15, 2)->default(0);
            $table->decimal('price_sell', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_products');
    }
};
