<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('customer')->after('email'); // super_admin | admin | customer
            $table->string('status')->default('active')->after('role'); // active | inactive | pending
            $table->unsignedBigInteger('business_category_id')->nullable()->after('status');
            $table->string('phone')->nullable()->after('business_category_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'status', 'business_category_id', 'phone']);
        });
    }
};
