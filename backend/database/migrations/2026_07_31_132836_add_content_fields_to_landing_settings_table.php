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
        Schema::table('landing_settings', function (Blueprint $table) {
            $table->json('features_platform')->nullable();
            $table->json('how_it_works_steps')->nullable();
            $table->json('faq_items')->nullable();
            $table->string('roi_title')->nullable();
            $table->text('roi_desc')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('landing_settings', function (Blueprint $table) {
            $table->dropColumn(['features_platform', 'how_it_works_steps', 'faq_items', 'roi_title', 'roi_desc']);
        });
    }
};
