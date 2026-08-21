<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('jasa_settings', function (Blueprint $table) {
            // Because tenant_id had a foreign key constraint to `tenants` `id`, we must drop it
            $table->dropForeign(['tenant_id']);
            $table->dropUnique(['tenant_id']);
        });

        // Drop column and re-add as string to match User->tenant_id ("TN-xxxx")
        Schema::table('jasa_settings', function (Blueprint $table) {
            $table->dropColumn('tenant_id');
        });

        Schema::table('jasa_settings', function (Blueprint $table) {
            $table->string('tenant_id', 32)->after('id')->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jasa_settings', function (Blueprint $table) {
            $table->dropColumn('tenant_id');
        });
        Schema::table('jasa_settings', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->after('id');
            $table->unique('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }
};
