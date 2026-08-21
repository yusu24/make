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
        // 1. Extend budidaya_settings
        Schema::table('budidaya_settings', function (Blueprint $table) {
            $table->string('farming_category')->default('aquaculture')->after('tenant_id'); // aquaculture, poultry, livestock, bird, other
            $table->string('farming_profile')->default('ikan_air_tawar')->after('farming_category'); // bioflok_lele, tambak_udang, broiler, layer, ruminansia, bird_breeding, etc.
            $table->string('tracking_mode')->default('group')->after('farming_profile'); // group, individual, hybrid
            $table->json('feature_flags')->nullable()->after('tracking_mode');
            $table->json('terminology')->nullable()->after('feature_flags');
        });

        // 2. Extend budidaya_ponds (Production Units)
        Schema::table('budidaya_ponds', function (Blueprint $table) {
            $table->string('unit_category')->default('pond')->after('name'); // pond, cage, coop, pen, aviary, aquarium, colony_cage, battery_cage
            $table->integer('capacity_head')->nullable()->after('max_fish_count'); // alias for animal capacity
        });

        // 3. Extend budidaya_cycles
        Schema::table('budidaya_cycles', function (Blueprint $table) {
            $table->unsignedBigInteger('species_id')->nullable()->after('pond_id');
            $table->string('category')->default('aquaculture')->after('species_id');
            $table->string('tracking_mode')->default('group')->after('category');
            $table->decimal('initial_weight_gram', 10, 2)->nullable()->after('seed_count');
            $table->decimal('initial_cost', 15, 2)->nullable()->after('initial_weight_gram');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budidaya_settings', function (Blueprint $table) {
            $table->dropColumn(['farming_category', 'farming_profile', 'tracking_mode', 'feature_flags', 'terminology']);
        });

        Schema::table('budidaya_ponds', function (Blueprint $table) {
            $table->dropColumn(['unit_category', 'capacity_head']);
        });

        Schema::table('budidaya_cycles', function (Blueprint $table) {
            $table->dropColumn(['species_id', 'category', 'tracking_mode', 'initial_weight_gram', 'initial_cost']);
        });
    }
};
