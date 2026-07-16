<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_ingredient_stock_movements', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('ingredient_id')->constrained('kuliner_ingredients')->cascadeOnDelete();
            $table->string('type', 30); // in | out | adjustment | void | return_supplier
            $table->decimal('quantity', 10, 2);
            $table->decimal('quantity_before', 10, 2);
            $table->decimal('quantity_after', 10, 2);
            $table->nullableMorphs('reference', 'kism_reference_index');
            $table->string('note')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['tenant_id', 'ingredient_id'], 'kism_tenant_ingredient_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_ingredient_stock_movements');
    }
};
