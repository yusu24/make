<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kuliner_settings', function (Blueprint $table) {
            $table->boolean('auto_backup_enabled')->default(false)->after('dine_in_enabled');
            $table->string('auto_backup_frequency')->default('weekly')->after('auto_backup_enabled'); // daily, weekly, monthly
            $table->string('auto_backup_format')->default('excel')->after('auto_backup_frequency'); // excel, json
            $table->string('auto_backup_email')->nullable()->after('auto_backup_format');
            $table->timestamp('last_auto_backup_at')->nullable()->after('auto_backup_email');
        });
    }

    public function down(): void
    {
        Schema::table('kuliner_settings', function (Blueprint $table) {
            $table->dropColumn([
                'auto_backup_enabled',
                'auto_backup_frequency',
                'auto_backup_format',
                'auto_backup_email',
                'last_auto_backup_at',
            ]);
        });
    }
};
