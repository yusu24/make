<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_purchases', function (Blueprint $table) {
            $table->string('status')->default('received')->after('supplier_id');
            $table->date('expected_date')->nullable()->after('purchase_date');
        });
    }

    public function down(): void
    {
        Schema::table('retail_purchases', function (Blueprint $table) {
            $table->dropColumn(['status', 'expected_date']);
        });
    }
};
