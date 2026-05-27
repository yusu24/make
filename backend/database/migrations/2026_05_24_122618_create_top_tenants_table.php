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
        Schema::create('top_tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('plan');
            $table->string('category');
            $table->decimal('revenue', 15, 2);
            $table->string('joined');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('top_tenants');
    }
};
