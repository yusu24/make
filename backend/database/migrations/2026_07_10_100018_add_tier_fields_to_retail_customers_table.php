<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_customers', function (Blueprint $table) {
            $table->decimal('total_spent', 15, 2)->default(0)->after('points');
            $table->string('tier', 20)->default('regular')->after('total_spent');
        });
    }

    public function down(): void
    {
        Schema::table('retail_customers', function (Blueprint $table) {
            $table->dropColumn(['total_spent', 'tier']);
        });
    }
};
