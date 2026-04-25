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
        Schema::create('budidaya_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('pond_id')->constrained('budidaya_ponds')->onDelete('cascade');
            $table->string('seed_type');
            $table->integer('seed_count');
            $table->date('seed_date');
            $table->date('expected_harvest_date')->nullable();
            $table->string('status')->default('pembibitan'); // pembibitan, pembesaran, panen
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_cycles');
    }
};
