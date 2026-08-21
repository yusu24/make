<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('outlet_id')->nullable()->after('tenant_id');
            $table->foreign('outlet_id')->references('id')->on('retail_outlets')->onDelete('set null');
        });

        Schema::table('retail_purchases', function (Blueprint $table) {
            $table->unsignedBigInteger('outlet_id')->nullable()->after('tenant_id');
            $table->foreign('outlet_id')->references('id')->on('retail_outlets')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('retail_purchases', function (Blueprint $table) {
            $table->dropForeign(['outlet_id']);
            $table->dropColumn('outlet_id');
        });

        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->dropForeign(['outlet_id']);
            $table->dropColumn('outlet_id');
        });
    }
};
