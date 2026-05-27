<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('type', ['maintenance', 'feature', 'promo', 'security'])->default('feature');
            $table->enum('target', ['all', 'free', 'basic', 'pro'])->default('all');
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->text('content');
            $table->date('date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
