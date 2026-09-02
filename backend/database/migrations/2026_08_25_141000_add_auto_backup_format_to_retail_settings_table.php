<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_settings', function (Blueprint $table) {
            $table->string('auto_backup_format')->default('excel')->after('auto_backup_frequency'); // excel, json
        });
    }

    public function down(): void
    {
        Schema::table('retail_settings', function (Blueprint $table) {
            $table->dropColumn('auto_backup_format');
        });
    }
};
