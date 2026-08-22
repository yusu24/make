<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('landing_settings', function (Blueprint $table) {
            $table->string('payment_provider')->nullable()->default('midtrans')->after('footer_security_text');
            $table->boolean('payment_is_production')->default(false)->after('payment_provider');
            $table->string('payment_merchant_id')->nullable()->default('M109283-BIZORA')->after('payment_is_production');
            $table->string('payment_client_key')->nullable()->default('SB-Mid-client-88a9BcD1293')->after('payment_merchant_id');
            $table->string('payment_server_key')->nullable()->default('SB-Mid-server-99kLzP3921')->after('payment_client_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('landing_settings', function (Blueprint $table) {
            $table->dropColumn([
                'payment_provider',
                'payment_is_production',
                'payment_merchant_id',
                'payment_client_key',
                'payment_server_key',
            ]);
        });
    }
};
