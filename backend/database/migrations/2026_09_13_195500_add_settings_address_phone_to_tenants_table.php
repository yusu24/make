<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            if (!Schema::hasColumn('tenants', 'settings')) {
                $table->json('settings')->nullable()->after('business_name');
            }
            if (!Schema::hasColumn('tenants', 'address')) {
                $table->text('address')->nullable()->after('business_name');
            }
            if (!Schema::hasColumn('tenants', 'phone')) {
                $table->string('phone')->nullable()->after('business_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            if (Schema::hasColumn('tenants', 'settings')) {
                $table->dropColumn('settings');
            }
            if (Schema::hasColumn('tenants', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('tenants', 'phone')) {
                $table->dropColumn('phone');
            }
        });
    }
};
