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
        Schema::create('omnichannel_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable();
            $table->string('order_id');
            $table->string('buyer_name')->nullable();
            $table->string('courier');
            $table->string('awb')->nullable();
            $table->string('status', 50)->default('Pending');
            $table->timestamp('pickup_schedule')->nullable();
            $table->boolean('label_printed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('omnichannel_shipments');
    }
};
