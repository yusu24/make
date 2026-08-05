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
        Schema::table('kuliner_settings', function (Blueprint $table) {
            $table->boolean('enable_tax')->default(false)->after('logo_url');
            $table->decimal('tax_rate', 5, 2)->default(10.00)->after('enable_tax'); // Default PB1 10%
            $table->decimal('service_charge_rate', 5, 2)->default(0)->after('tax_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kuliner_settings', function (Blueprint $table) {
            $table->dropColumn(['enable_tax', 'tax_rate', 'service_charge_rate']);
        });
    }
};
