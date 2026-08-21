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
        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->integer('points_earned')->default(0)->after('payment_method');
            $table->integer('points_redeemed')->default(0)->after('points_earned');
            $table->decimal('points_discount_amount', 15, 2)->default(0)->after('points_redeemed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->dropColumn(['points_earned', 'points_redeemed', 'points_discount_amount']);
        });
    }
};
