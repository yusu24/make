<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jasa_spareparts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id', 32)->index();
            $table->string('item_code', 50)->unique();
            $table->string('name', 150);
            $table->string('category', 100);
            $table->decimal('price', 14, 2);
            $table->integer('stock')->default(0);
            $table->string('unit', 30)->default('Pcs');
            $table->integer('min_stock_alert')->default(5);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jasa_spareparts');
    }
};
