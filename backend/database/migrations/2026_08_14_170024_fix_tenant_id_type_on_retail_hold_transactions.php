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
        Schema::table('retail_hold_transactions', function (Blueprint $table) {
            // Drop the foreign key first
            $table->dropForeign(['tenant_id']);
            // Change the column type to string
        });

        Schema::table('retail_hold_transactions', function (Blueprint $table) {
            $table->string('tenant_id')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retail_hold_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->change();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }
};
