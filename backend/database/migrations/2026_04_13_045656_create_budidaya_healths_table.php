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
        Schema::create('budidaya_healths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained('budidaya_cycles')->onDelete('cascade');
            $table->text('disease_note')->nullable();
            $table->text('treatment_note')->nullable();
            $table->integer('mortality_count')->default(0);
            $table->date('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_healths');
    }
};
