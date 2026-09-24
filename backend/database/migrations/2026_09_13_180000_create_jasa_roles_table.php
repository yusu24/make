<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('jasa_roles')) {
            Schema::create('jasa_roles', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->string('name');
                $table->string('description')->nullable();
                $table->json('permissions')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasColumn('users', 'jasa_role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('jasa_role_id')->nullable()->after('role');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'jasa_role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('jasa_role_id');
            });
        }
        Schema::dropIfExists('jasa_roles');
    }
};
