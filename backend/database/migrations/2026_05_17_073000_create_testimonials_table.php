<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role');
            $table->string('avatar_text', 5)->nullable();
            $table->string('avatar_bg')->default('#e2e8f0');
            $table->string('avatar_color')->default('#475569');
            $table->integer('stars')->default(5);
            $table->text('text');
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed initial real-world default testimonials
        DB::table('testimonials')->insert([
            [
                'name' => 'Siti Rahayu',
                'role' => 'Pemilik Warung Kelontong, Surabaya',
                'avatar_text' => 'SR',
                'avatar_bg' => '#E1F5EE',
                'avatar_color' => '#0F6E56',
                'stars' => 5,
                'text' => 'Sejak pakai UMKM Hub, omzet warung saya naik 40%. Fitur kasirnya mudah banget dipelajari.',
                'active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Budi Prasetyo',
                'role' => 'Pembudidaya Ikan Lele, Sidoarjo',
                'avatar_text' => 'BP',
                'avatar_bg' => '#E6F1FB',
                'avatar_color' => '#185FA5',
                'stars' => 5,
                'text' => 'Monitoring kolam lele saya jadi super gampang. Notifikasi pakan otomatis sangat membantu.',
                'active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dewi Nurhayati',
                'role' => 'Pemilik Warung Makan, Malang',
                'avatar_text' => 'DN',
                'avatar_bg' => '#FAEEDA',
                'avatar_color' => '#BA7517',
                'stars' => 5,
                'text' => 'Menu digital dan integrasi GoFood-nya bikin pelanggan makin banyak. Laporan HPP juga akurat.',
                'active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
