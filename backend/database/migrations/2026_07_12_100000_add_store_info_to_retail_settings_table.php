<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_settings', function (Blueprint $table) {
            $table->string('store_name')->nullable()->after('tenant_id');
            $table->text('store_address')->nullable()->after('store_name');
            $table->string('store_phone')->nullable()->after('store_address');
            $table->string('currency', 10)->default('IDR')->after('store_phone');
            $table->text('receipt_header')->nullable()->after('currency');
            $table->boolean('enable_tax')->default(true)->after('receipt_footer');
            $table->boolean('enable_loyalty')->default(true)->after('points_ratio');
        });
    }

    public function down(): void
    {
        Schema::table('retail_settings', function (Blueprint $table) {
            $table->dropColumn([
                'store_name', 'store_address', 'store_phone',
                'currency', 'receipt_header', 'enable_tax', 'enable_loyalty',
            ]);
        });
    }
};
