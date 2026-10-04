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
            if (!Schema::hasColumn('landing_settings', 'require_registration_otp')) {
                $table->boolean('require_registration_otp')->default(false)->after('show_sandbox');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('landing_settings', function (Blueprint $table) {
            if (Schema::hasColumn('landing_settings', 'require_registration_otp')) {
                $table->dropColumn('require_registration_otp');
            }
        });
    }
};
