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
        if (Schema::hasTable('kuliner_settings')) {
            Schema::table('kuliner_settings', function (Blueprint $table) {
                if (!Schema::hasColumn('kuliner_settings', 'qris_image_path')) {
                    $table->string('qris_image_path')->nullable()->after('website_url');
                }
                if (!Schema::hasColumn('kuliner_settings', 'qris_image_url')) {
                    $table->string('qris_image_url')->nullable()->after('qris_image_path');
                }
                if (!Schema::hasColumn('kuliner_settings', 'bank_name')) {
                    $table->string('bank_name')->nullable()->after('qris_image_url');
                }
                if (!Schema::hasColumn('kuliner_settings', 'bank_account_no')) {
                    $table->string('bank_account_no')->nullable()->after('bank_name');
                }
                if (!Schema::hasColumn('kuliner_settings', 'bank_account_name')) {
                    $table->string('bank_account_name')->nullable()->after('bank_account_no');
                }
            });
        }

        if (Schema::hasTable('jasa_settings')) {
            Schema::table('jasa_settings', function (Blueprint $table) {
                if (!Schema::hasColumn('jasa_settings', 'qris_image_path')) {
                    $table->string('qris_image_path')->nullable()->after('document_prefix');
                }
                if (!Schema::hasColumn('jasa_settings', 'qris_image_url')) {
                    $table->string('qris_image_url')->nullable()->after('qris_image_path');
                }
                if (!Schema::hasColumn('jasa_settings', 'bank_name')) {
                    $table->string('bank_name')->nullable()->after('qris_image_url');
                }
                if (!Schema::hasColumn('jasa_settings', 'bank_account_no')) {
                    $table->string('bank_account_no')->nullable()->after('bank_name');
                }
                if (!Schema::hasColumn('jasa_settings', 'bank_account_name')) {
                    $table->string('bank_account_name')->nullable()->after('bank_account_no');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('kuliner_settings')) {
            Schema::table('kuliner_settings', function (Blueprint $table) {
                $table->dropColumn(['qris_image_path', 'qris_image_url', 'bank_name', 'bank_account_no', 'bank_account_name']);
            });
        }

        if (Schema::hasTable('jasa_settings')) {
            Schema::table('jasa_settings', function (Blueprint $table) {
                $table->dropColumn(['qris_image_path', 'qris_image_url', 'bank_name', 'bank_account_no', 'bank_account_name']);
            });
        }
    }
};
