<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('supplier_id')->nullable()->constrained('kuliner_suppliers')->nullOnDelete();
            $table->string('code')->nullable();
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('unit');
            $table->decimal('last_price', 15, 2)->default(0);
            $table->decimal('min_stock', 10, 2)->default(0);
            $table->decimal('stock', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'code']);
            $table->index(['tenant_id', 'name']);
            $table->index(['tenant_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_ingredients');
    }
};
