<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('kuliner_product_id')->nullable()->after('product_id')->constrained('kuliner_products')->nullOnDelete();
            $table->foreignId('bundle_id')->nullable()->after('kuliner_product_id')->constrained('kuliner_bundles')->nullOnDelete();
            $table->json('modifiers')->nullable()->after('subtotal');
            $table->json('addons')->nullable()->after('modifiers');
            $table->string('item_notes')->nullable()->after('addons');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('kuliner_product_id');
            $table->dropConstrainedForeignId('bundle_id');
            $table->dropColumn(['modifiers', 'addons', 'item_notes']);
        });
    }
};
