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
        Schema::table('landing_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('landing_settings', 'bank_accounts')) {
                $table->json('bank_accounts')->nullable()->after('bank_account_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('landing_settings', function (Blueprint $table) {
            if (Schema::hasColumn('landing_settings', 'bank_accounts')) {
                $table->dropColumn('bank_accounts');
            }
        });
    }
};
