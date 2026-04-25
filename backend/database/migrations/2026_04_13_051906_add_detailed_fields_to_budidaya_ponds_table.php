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
        Schema::table('budidaya_ponds', function (Blueprint $table) {
            $table->string('code')->after('tenant_id')->nullable();
            $table->string('area')->after('name')->nullable(); // For groupings: Blok A, Blok B
            $table->decimal('area_m2', 10, 2)->after('type')->nullable();
            $table->integer('depth_cm')->after('area_m2')->nullable();
            $table->integer('max_fish_count')->after('depth_cm')->nullable();
            $table->string('location')->after('max_fish_count')->nullable();
            // Change status logic in application, DB is already string
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budidaya_ponds', function (Blueprint $table) {
            $table->dropColumn(['code', 'area', 'area_m2', 'depth_cm', 'max_fish_count', 'location']);
        });
    }
};
