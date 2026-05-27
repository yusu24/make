<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1. Optimize users index for rapid withCount queries
        Schema::table('users', function (Blueprint $table) {
            $table->index('business_category_id');
        });

        // 2. Create landing_settings table
        Schema::create('landing_settings', function (Blueprint $table) {
            $table->id();
            $table->string('hero_title')->default('Kelola Bisnis UMKM');
            $table->string('hero_subtitle')->default('Lebih Cerdas & Mudah');
            $table->text('hero_desc')->nullable();
            $table->text('campaign_text')->nullable();
            $table->boolean('campaign_active')->default(true);
            $table->boolean('show_sandbox')->default(true);
            $table->boolean('show_features')->default(true);
            $table->boolean('show_testimonials')->default(true);
            $table->string('bank_name')->default('BANK BCA');
            $table->string('bank_account_no')->default('8837 001 992');
            $table->string('bank_account_name')->default('PT Antigravity Global SaaS');
            $table->integer('price_basic')->default(149000);
            $table->integer('price_pro')->default(299000);
            $table->timestamps();
        });

        // 3. Seed default landing settings
        DB::table('landing_settings')->insert([
            'hero_title' => 'Kelola Bisnis UMKM',
            'hero_subtitle' => 'Lebih Cerdas & Mudah',
            'hero_desc' => 'Satu platform untuk retail, budidaya ikan, kuliner, dan jasa. Kelola stok, pesanan, laporan keuangan, dan pelanggan dalam satu genggaman.',
            'campaign_text' => 'Promo Spesial Kategori — Potongan Harga Upgrade Paket Aktif! Buat UMKM Anda naik tingkat. Hubungi admin untuk mendapatkan promo menarik per kategori bisnis Anda.',
            'campaign_active' => true,
            'show_sandbox' => true,
            'show_features' => true,
            'show_testimonials' => true,
            'bank_name' => 'BANK BCA',
            'bank_account_no' => '8837 001 992',
            'bank_account_name' => 'PT Antigravity Global SaaS',
            'price_basic' => 149000,
            'price_pro' => 299000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_settings');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['business_category_id']);
        });
    }
};
