<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_discounts', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('code');
            $table->string('name');
            $table->string('type', 20); // percentage | flat | bogo
            $table->decimal('value', 15, 2)->default(0);
            $table->decimal('min_purchase', 15, 2)->default(0);
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_discounts');
    }
};
