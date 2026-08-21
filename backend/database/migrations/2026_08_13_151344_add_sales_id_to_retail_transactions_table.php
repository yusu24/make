<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('sales_id')->nullable()->after('customer_id');
            $table->foreign('sales_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('retail_transactions', function (Blueprint $table) {
            $table->dropForeign(['sales_id']);
            $table->dropColumn('sales_id');
        });
    }
};
