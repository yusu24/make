<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budidaya_inventories', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name');
            $table->string('category'); // pakan, bibit, obat, peralatan, dll
            $table->decimal('stock', 15, 2)->default(0);
            $table->string('unit')->default('kg'); // kg, gram, ekor, botol, buah
            $table->decimal('min_stock', 15, 2)->default(0);
            $table->decimal('price_per_unit', 15, 2)->default(0);
            $table->string('description')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        Schema::create('budidaya_inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained('budidaya_inventories')->onDelete('cascade');
            $table->enum('type', ['in', 'out']);
            $table->decimal('quantity', 15, 2);
            $table->string('note')->nullable();
            $table->timestamp('transaction_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budidaya_inventory_logs');
        Schema::dropIfExists('budidaya_inventories');
    }
};
