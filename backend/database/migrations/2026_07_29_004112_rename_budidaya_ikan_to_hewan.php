<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('business_categories')
            ->where('slug', 'budidaya-ikan')
            ->update([
                'name' => 'Budidaya Hewan',
                'slug' => 'budidaya-hewan',
                'description' => 'Pemantauan kandang/kolam & siklus panen',
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('business_categories')
            ->where('slug', 'budidaya-hewan')
            ->update([
                'name' => 'Budidaya Ikan',
                'slug' => 'budidaya-ikan',
                'description' => 'Pemantauan kolam ikan & siklus panen',
            ]);
    }
};
