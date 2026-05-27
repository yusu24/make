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
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->nullable();
            $table->string('name')->nullable(); // For manual or unregistered users
            $table->string('subject');
            $table->text('description')->nullable();
            $table->enum('category', ['bug', 'question', 'feature', 'billing'])->default('bug');
            $table->enum('priority', ['high', 'medium', 'low'])->default('low');
            $table->enum('status', ['open', 'in_progress', 'resolved'])->default('open');
            $table->string('assigned')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')
                  ->references('tenant_id')
                  ->on('tenants')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};
