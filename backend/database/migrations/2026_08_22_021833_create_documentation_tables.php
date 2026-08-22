<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentation_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('documentation_categories')->nullOnDelete();
            $table->string('module')->nullable()->comment('Misal: retail, jasa, kuliner, budidaya, umum');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('documentation_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('documentation_categories')->nullOnDelete();
            $table->string('module')->nullable();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('content')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('last_updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('featured_image_path')->nullable();
            $table->string('version')->default('1.0');
            $table->enum('access_level', ['public', 'authenticated', 'tenant', 'admin'])->default('public');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('documentation_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('documentation_articles')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_type')->nullable(); // image, document
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('documentation_journeys', function (Blueprint $table) {
            $table->id();
            $table->string('module')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('access_level', ['public', 'authenticated', 'tenant', 'admin'])->default('public');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('documentation_journey_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journey_id')->constrained('documentation_journeys')->cascadeOnDelete();
            $table->foreignId('article_id')->nullable()->constrained('documentation_articles')->nullOnDelete();
            $table->string('step_name');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentation_journey_steps');
        Schema::dropIfExists('documentation_journeys');
        Schema::dropIfExists('documentation_media');
        Schema::dropIfExists('documentation_articles');
        Schema::dropIfExists('documentation_categories');
    }
};
