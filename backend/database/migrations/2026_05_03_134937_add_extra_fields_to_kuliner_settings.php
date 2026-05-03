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
            $table->string('operational_days')->nullable()->after('opening_hours');
            $table->integer('total_tables')->nullable()->after('operational_days');
            $table->string('website_url')->nullable()->after('logo_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kuliner_settings', function (Blueprint $table) {
            $table->dropColumn(['operational_days', 'total_tables', 'website_url']);
        });
    }
};
