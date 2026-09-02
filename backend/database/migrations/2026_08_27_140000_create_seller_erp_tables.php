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
        if (!Schema::hasTable('seller_products')) {
            Schema::create('seller_products', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id')->index();
                $table->string('name');
                $table->string('sku')->index();
                $table->string('category')->nullable();
                $table->decimal('price', 15, 2)->default(0);
                $table->decimal('cost_price', 15, 2)->default(0);
                $table->integer('stock')->default(0);
                $table->integer('min_stock')->default(5);
                $table->integer('weight_gram')->default(100);
                $table->string('image_url')->nullable();
                $table->text('description')->nullable();
                $table->string('status')->default('Aktif');
                $table->json('marketplace_mappings')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('seller_channels')) {
            Schema::create('seller_channels', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id')->index();
                $table->string('platform'); // shopee, tokopedia, tiktok, lazada
                $table->string('store_name');
                $table->string('account_id')->nullable();
                $table->string('status')->default('connected'); // connected, disconnected, error
                $table->boolean('auto_sync')->default(true);
                $table->integer('sync_interval_mins')->default(15);
                $table->timestamp('last_sync_at')->nullable();
                $table->text('auth_token')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('seller_orders')) {
            Schema::create('seller_orders', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id')->index();
                $table->string('order_no')->index();
                $table->string('platform'); // shopee, tokopedia, tiktok, lazada, offline_pos
                $table->string('customer_name');
                $table->string('customer_phone')->nullable();
                $table->text('customer_address')->nullable();
                $table->string('courier')->nullable();
                $table->string('tracking_no')->nullable();
                $table->string('status')->default('Perlu Dikirim'); // Belum Bayar, Perlu Dikirim, Dikirim, Selesai, Dibatalkan
                $table->decimal('total_amount', 15, 2)->default(0);
                $table->decimal('shipping_cost', 15, 2)->default(0);
                $table->string('payment_method')->default('Transfer Bank');
                $table->json('items')->nullable();
                $table->text('notes')->nullable();
                $table->timestamp('order_date')->useCurrent();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('seller_sync_logs')) {
            Schema::create('seller_sync_logs', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id')->index();
                $table->string('platform');
                $table->string('sync_type')->default('Stok & Harga');
                $table->string('status')->default('Success'); // Success, Warning, Failed
                $table->integer('items_count')->default(0);
                $table->text('message')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_sync_logs');
        Schema::dropIfExists('seller_orders');
        Schema::dropIfExists('seller_channels');
        Schema::dropIfExists('seller_products');
    }
};
