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
        Schema::table('budidaya_feedings', function (Blueprint $table) {
            // Check if the column exists to avoid errors on fresh installs where we modified the original migration
            if (Schema::hasColumn('budidaya_feedings', 'feed_stock_id')) {
                $table->dropForeign(['feed_stock_id']);
                $table->dropColumn('feed_stock_id');
            }
            if (!Schema::hasColumn('budidaya_feedings', 'inventory_id')) {
                $table->foreignId('inventory_id')->after('cycle_id')->constrained('budidaya_inventories')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budidaya_feedings', function (Blueprint $table) {
            if (Schema::hasColumn('budidaya_feedings', 'inventory_id')) {
                $table->dropForeign(['inventory_id']);
                $table->dropColumn('inventory_id');
            }
            if (!Schema::hasColumn('budidaya_feedings', 'feed_stock_id')) {
                // If rolling back, we won't strictly enforce the old foreign key constraint if the table is gone, but we can add the column back.
                $table->unsignedBigInteger('feed_stock_id')->after('cycle_id')->nullable();
            }
        });
    }
};
