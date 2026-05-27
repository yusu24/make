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
        Schema::create('kuliner_promos', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('type', ['discount', 'nominal', 'bundle'])->default('discount');
            $table->string('value');
            $table->text('description')->nullable();
            $table->integer('quota')->default(0); // 0 means unlimited
            $table->integer('used_count')->default(0);
            $table->dateTime('expired_at')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kuliner_promos');
    }
};
