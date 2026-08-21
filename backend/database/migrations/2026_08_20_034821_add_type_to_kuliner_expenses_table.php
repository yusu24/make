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
        Schema::table('kuliner_expenses', function (Blueprint $table) {
            $table->enum('type', ['income', 'expense'])->default('expense')->after('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kuliner_expenses', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
