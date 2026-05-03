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
        Schema::create('kuliner_testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('customer_name');
            $table->integer('rating')->default(5);
            $table->text('comment');
            $table->string('customer_role')->nullable();
            $table->boolean('is_displayed')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('tenant_id')->on('tenants')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_testimonials');
    }
};
