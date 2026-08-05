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
        Schema::create('omnichannel_product_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable();
            $table->foreignId('marketplace_account_id')->constrained('omnichannel_marketplace_accounts')->cascadeOnDelete();
            $table->string('local_sku')->nullable();
            $table->unsignedBigInteger('local_product_id')->nullable();
            $table->string('marketplace_product_id');
            $table->string('marketplace_sku')->nullable();
            $table->string('sync_status', 30)->default('mapped');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('omnichannel_product_mappings');
    }
};
