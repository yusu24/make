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
        Schema::table('seller_channels', function (Blueprint $table) {
            $table->json('api_credentials')->nullable()->after('auth_token');
            $table->string('api_environment')->default('live')->after('api_credentials');
            $table->text('notes')->nullable()->after('api_environment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_channels', function (Blueprint $table) {
            $table->dropColumn(['api_credentials', 'api_environment', 'notes']);
        });
    }
};
