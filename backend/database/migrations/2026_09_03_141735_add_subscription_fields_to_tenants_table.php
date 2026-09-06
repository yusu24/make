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
        Schema::table('tenants', function (Blueprint $table) {
            if (!Schema::hasColumn('tenants', 'subscription_expires_at')) {
                $table->timestamp('subscription_expires_at')->nullable()->after('trial_ends_at');
            }
            if (!Schema::hasColumn('tenants', 'subscription_status')) {
                $table->string('subscription_status')->default('active')->after('subscription_plan');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['subscription_expires_at', 'subscription_status']);
        });
    }
};
