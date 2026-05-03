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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_phone')->nullable()->after('customer_name');
            $table->string('order_type')->nullable()->after('customer_phone'); // dine_in, take_away
            $table->string('table_number')->nullable()->after('order_type');
            $table->string('payment_method')->nullable()->after('table_number');
            $table->text('notes')->nullable()->after('payment_method');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('name')->after('order_id');
            $table->unsignedBigInteger('product_id')->nullable()->change();
            $table->dropForeign(['product_id']); // Relax foreign key for dummy/deleted products
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['customer_phone', 'order_type', 'table_number', 'payment_method', 'notes']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('name');
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
            // Re-adding foreign key might fail if data is inconsistent, so we'll be careful
        });
    }
};
