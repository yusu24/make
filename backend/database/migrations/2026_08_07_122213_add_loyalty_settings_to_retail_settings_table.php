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
        Schema::table('retail_settings', function (Blueprint $table) {
            $table->decimal('point_value_rupiah', 15, 2)->default(1)->after('points_ratio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retail_settings', function (Blueprint $table) {
            $table->dropColumn('point_value_rupiah');
        });
    }
};
