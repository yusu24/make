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
        Schema::table('budidaya_samplings', function (Blueprint $table) {
            $table->unsignedInteger('sample_count')->nullable()->after('estimated_biomass_kg');
            $table->text('notes')->nullable()->after('sample_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budidaya_samplings', function (Blueprint $table) {
            //
        });
    }
};
