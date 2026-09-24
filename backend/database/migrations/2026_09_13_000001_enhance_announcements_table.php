<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (!Schema::hasColumn('announcements', 'display_type')) {
                $table->string('display_type', 30)->default('modal')->after('type');
            }
            if (!Schema::hasColumn('announcements', 'action_url')) {
                $table->string('action_url', 500)->nullable()->after('content');
            }
            if (!Schema::hasColumn('announcements', 'action_text')) {
                $table->string('action_text', 100)->nullable()->after('action_url');
            }
            if (!Schema::hasColumn('announcements', 'expires_at')) {
                $table->dateTime('expires_at')->nullable()->after('date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn(['display_type', 'action_url', 'action_text', 'expires_at']);
        });
    }
};