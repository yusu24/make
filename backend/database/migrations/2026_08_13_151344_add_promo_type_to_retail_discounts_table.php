<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_discounts', function (Blueprint $table) {
            $table->string('promo_type')->default('percentage')->after('code'); // percentage, fixed, conditional
            $table->json('conditions')->nullable()->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('retail_discounts', function (Blueprint $table) {
            $table->dropColumn(['promo_type', 'conditions']);
        });
    }
};
