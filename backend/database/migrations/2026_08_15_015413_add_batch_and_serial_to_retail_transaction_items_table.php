<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_transaction_items', function (Blueprint $table) {
            $table->string('batch_no')->nullable()->after('unit');
            $table->string('serial_number')->nullable()->after('batch_no');
        });
    }

    public function down(): void
    {
        Schema::table('retail_transaction_items', function (Blueprint $table) {
            $table->dropColumn(['batch_no', 'serial_number']);
        });
    }
};
