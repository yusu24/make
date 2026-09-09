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
        if (Schema::hasTable('api_keys')) {
            Schema::table('api_keys', function (Blueprint $table) {
                if (!Schema::hasColumn('api_keys', 'tenant_id')) {
                    $table->string('tenant_id')->nullable()->after('id')->index();
                }
            });
        }

        if (Schema::hasTable('webhooks')) {
            Schema::table('webhooks', function (Blueprint $table) {
                if (!Schema::hasColumn('webhooks', 'tenant_id')) {
                    $table->string('tenant_id')->nullable()->after('id')->index();
                }
                if (!Schema::hasColumn('webhooks', 'events')) {
                    $table->json('events')->nullable()->after('url');
                }
                if (!Schema::hasColumn('webhooks', 'secret_key')) {
                    $table->string('secret_key', 64)->nullable()->after('events');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('api_keys')) {
            Schema::table('api_keys', function (Blueprint $table) {
                if (Schema::hasColumn('api_keys', 'tenant_id')) {
                    $table->dropColumn('tenant_id');
                }
            });
        }

        if (Schema::hasTable('webhooks')) {
            Schema::table('webhooks', function (Blueprint $table) {
                if (Schema::hasColumn('webhooks', 'tenant_id')) {
                    $table->dropColumn('tenant_id');
                }
                if (Schema::hasColumn('webhooks', 'events')) {
                    $table->dropColumn('events');
                }
                if (Schema::hasColumn('webhooks', 'secret_key')) {
                    $table->dropColumn('secret_key');
                }
            });
        }
    }
};
