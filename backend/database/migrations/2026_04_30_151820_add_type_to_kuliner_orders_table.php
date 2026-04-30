<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kuliner_orders', function (Blueprint $table) {
            $table->string('order_type')->default('dine_in')->after('payment_method'); // dine_in, take_away
            $table->string('table_number')->nullable()->after('order_type');
        });
    }

    public function down(): void
    {
        Schema::table('kuliner_orders', function (Blueprint $table) {
            $table->dropColumn(['order_type', 'table_number']);
        });
    }
};
