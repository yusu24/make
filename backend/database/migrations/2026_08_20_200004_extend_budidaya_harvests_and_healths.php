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
        // 1. Extend budidaya_harvests
        Schema::table('budidaya_harvests', function (Blueprint $table) {
            $table->string('output_type')->default('meat_biomass')->after('cycle_id'); // meat_biomass, eggs, milk, live_count, offspring
            $table->integer('total_count')->nullable()->after('output_type'); // Ekor / Butir / Tray
            $table->string('unit_label')->default('kg')->after('total_count'); // kg, butir, tray, liter, ekor
            $table->decimal('total_weight_kg', 10, 2)->nullable()->change(); // make nullable if selling by pieces/eggs
            $table->json('grade_breakdown')->nullable()->after('notes'); // e.g. {"grade_a": 100, "grade_b": 20, "broken": 5}
        });

        // 2. Extend budidaya_healths
        Schema::table('budidaya_healths', function (Blueprint $table) {
            $table->unsignedBigInteger('animal_id')->nullable()->after('cycle_id'); // for individual animal tracking
            $table->string('action_type')->default('health_check')->after('animal_id'); // health_check, vaccination, medication, vitamin, quarantine, mortality
            $table->string('medicine_name')->nullable()->after('treatment_note');
            $table->decimal('dosage', 10, 2)->nullable()->after('medicine_name');
            $table->string('dosage_unit')->nullable()->after('dosage'); // ml, gram, tablet, tetes
            
            $table->foreign('animal_id')->references('id')->on('budidaya_animals')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budidaya_harvests', function (Blueprint $table) {
            $table->dropColumn(['output_type', 'total_count', 'unit_label', 'grade_breakdown']);
        });

        Schema::table('budidaya_healths', function (Blueprint $table) {
            $table->dropForeign(['animal_id']);
            $table->dropColumn(['animal_id', 'action_type', 'medicine_name', 'dosage', 'dosage_unit']);
        });
    }
};
